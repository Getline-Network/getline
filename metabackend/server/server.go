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

package server

import (
	"fmt"
	"sort"

	"golang.org/x/net/context"

	"github.com/getline-network/getline/metabackend/deployments"
	"github.com/getline-network/getline/metabackend/model"
	"github.com/getline-network/getline/metabackend/util"
	"github.com/getline-network/getline/pb"
	"github.com/golang/glog"
)

// gRPC server implementation for pb.Metabackend.
type Server struct {
	Deployment *deployments.Deployment
	Model      *model.Model
}

func (s *Server) GetDeployment(ctx context.Context, req *pb.GetDeploymentRequest) (*pb.GetDeploymentResponse, error) {
	networkId := req.GetNetworkId()
	network, ok := s.Deployment.Networks[networkId]
	if !ok {
		return nil, fmt.Errorf("no such network ID")
	}

	res := &pb.GetDeploymentResponse{
		NetworkId: network.ID,
	}
	for _, contract := range network.Contracts {
		pbc := &pb.Contract{
			Name:         contract.Name,
			Address:      util.ProtoAddress(contract.GetAddress(networkId)),
			LinkedBinary: contract.LinkedBinary,
			Abi:          contract.ABI.Proto(),
		}
		res.Contract = append(res.Contract, pbc)
	}
	sort.Slice(res.Contract, func(i, j int) bool {
		return res.Contract[i].Name < res.Contract[j].Name
	})
	return res, nil
}

func (s *Server) GetLoans(ctx context.Context, req *pb.GetLoansRequest) (*pb.GetLoansResponse, error) {
	networkId := req.GetNetworkId()
	network, ok := s.Deployment.Networks[networkId]
	if !ok {
		return nil, fmt.Errorf("no such network ID")
	}

	query := model.LoanQuery{
		Network: network.ID,
	}
	if req.GetOwner() != nil {
		owner, err := util.ProtoAddressDecode(req.GetOwner())
		if err != nil {
			return nil, fmt.Errorf("invalid owner specified: %v", err)
		}
		query.Borrower = &owner
	}

	query.ShortID = req.GetShortId()
	query.State = req.GetState()

	loans, err := query.Run(ctx, s.Model)
	if err != nil {
		glog.Errorf("LoanMetadataQuery: %v", err)
		return nil, fmt.Errorf("could not get loans")
	}

	cache := make([]*pb.LoanCache, len(loans))
	for i, loan := range loans {
		c := pb.LoanCache{
			Owner:             util.ProtoAddress(loan.Metadata.Borrower.Hex()),
			DeploymentAddress: util.ProtoAddress(loan.Metadata.DeployedAddress.Hex()),
			ShortId:           loan.Metadata.ShortID,
			Parameters:        loan.ProtoParameters(),
			Description:       loan.Metadata.Description,
			DeploymentState:   pb.LoanCache_DEPLOYED,
			BlockchainState:   loan.ProtoBlockchainState(),
		}
		cache[i] = &c
	}

	res := &pb.GetLoansResponse{
		NetworkId: network.ID,
		LoanCache: cache,
	}
	return res, nil
}

func (s *Server) IndexLoan(ctx context.Context, req *pb.IndexLoanRequest) (*pb.IndexLoanResponse, error) {
	networkId := req.GetNetworkId()
	_, ok := s.Deployment.Networks[networkId]
	if !ok {
		return nil, fmt.Errorf("no such network ID")
	}

	address, err := util.ProtoAddressDecode(req.GetLoan())
	if err != nil {
		return nil, fmt.Errorf("invalid loan address specified: %v", err)
	}

	tx, err := s.Model.Transaction()
	if err != nil {
		glog.Errorf("When beginning transaction: %v", err)
		return nil, fmt.Errorf("internal server error")
	}
	defer tx.Rollback()

	loan := s.Model.NewLoan()
	loan.Metadata.NetworkID = networkId
	loan.Metadata.Description = req.GetDescription()
	loan.Metadata.DeployedAddress = address

	if err = loan.LoadParametersFromBlockchain(ctx); err != nil {
		return nil, fmt.Errorf("invalid loan specified: %v", err)
	}

	loan.Metadata.Borrower = loan.Parameters.Borrower

	if err = loan.UpsertMetadata(ctx, tx); err != nil {
		glog.Errorf("When upserting metadata: %v", err)
		return nil, fmt.Errorf("internal server error")
	}

	if err = loan.InsertParameters(ctx, tx); err != nil {
		glog.Errorf("When inserting parameters: %v", err)
		return nil, fmt.Errorf("internal server error")
	}

	err = tx.Commit()
	if err != nil {
		glog.Errorf("When commiting transaction: %v", err)
		return nil, fmt.Errorf("internal server error")
	}

	res := &pb.IndexLoanResponse{
		loan.Metadata.ShortID,
	}
	return res, nil
}
