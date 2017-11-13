// Copyright 2017 Sergiusz Bazanski <q3k@boson.me>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"flag"
	"fmt"
	"net"
	"net/http"
	"os"

	"github.com/golang/glog"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	"github.com/getline-network/getline/metabackend/deployments"
	"github.com/getline-network/getline/metabackend/model"
	"github.com/getline-network/getline/metabackend/server"
	"github.com/getline-network/getline/pb"
)

var (
	flagListen     string
	flagListenHTTP string
	flagReflection bool

	flagDBDriver     string
	flagDBDataSource string
	flagDBInitSchema bool

	flagEthRemote string
)

func main() {
	flag.StringVar(&flagListen, "listen", "0.0.0.0:2000", "gRPC listen address")
	flag.StringVar(&flagListenHTTP, "listen_http", "0.0.0.0:2080", "gRPCWeb (HTTP) listen address")
	flag.BoolVar(&flagReflection, "reflection", true, "gRPC reflection")
	flag.StringVar(&flagDBDriver, "db_driver", "postgres", "SQL driver name")
	flag.StringVar(&flagDBDataSource, "db_data_source", "", "SQL driver data source")
	flag.BoolVar(&flagDBInitSchema, "db_init_schema", false, "Initialize SQL database with empty schema")
	flag.StringVar(&flagEthRemote, "eth_remote", "http://localhost:8545", "Ethereum IPC server address")
	flag.Parse()
	glog.Info("Starting...")

	// Load Truffle project from current working directory.
	cwd, err := os.Getwd()
	if err != nil {
		glog.Exit(err)
	}
	deployment, err := deployments.FromFilesystem(cwd)
	if err != nil {
		glog.Exitf("Could not load deployments: %v", err)
	}

	// Start gRPC.
	lis, err := net.Listen("tcp", flagListen)
	if err != nil {
		glog.Exit(err)
	}
	s := server.Server{
		Deployment: deployment,
	}
	grpc.EnableTracing = true
	grpcServer := grpc.NewServer()
	pb.RegisterMetabackendServer(grpcServer, &s)
	if flagReflection {
		reflection.Register(grpcServer)
	}
	go grpcServer.Serve(lis)
	glog.Infof("gRPC Listening on %q...", flagListen)

	// Start gRPCWeb.
	wrappedGrpc := grpcweb.WrapServer(grpcServer)
	httpServer := http.Server{
		Addr: flagListenHTTP,
	}
	http.HandleFunc("/", func(res http.ResponseWriter, req *http.Request) {
		if req.URL.Path != "/" {
			http.NotFound(res, req)
			return
		}
		fmt.Fprintf(res, "Hello there. This is metabackend.")
	})
	httpServer.Handler = http.HandlerFunc(func(resp http.ResponseWriter, req *http.Request) {
		if wrappedGrpc.IsGrpcWebRequest(req) {
			wrappedGrpc.ServeHttp(resp, req)
		}
		http.DefaultServeMux.ServeHTTP(resp, req)
	})
	go func() {
		err := httpServer.ListenAndServe()
		if err != nil {
			glog.Exit(err)
		}
	}()
	glog.Infof("gRPCWeb (HTTP) Listening on %q...", flagListenHTTP)

	// Start model.
	model, err := model.New(flagDBDriver, flagDBDataSource, flagEthRemote, &s)
	if err != nil {
		glog.Exitf("Could not start model: %v", err)
	}
	if flagDBInitSchema {
		err = model.InitializeSchema()
		if err != nil {
			glog.Exitf("Could not initialize model schema: %v", err)
		}
		return
	}
	s.Model = model

	select {}
}
