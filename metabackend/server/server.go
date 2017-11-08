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
	"encoding/json"
	"fmt"
	"sort"
	"sync"

	"golang.org/x/net/context"

	"github.com/getline-network/getline/metabackend/deployments"
	"github.com/getline-network/getline/metabackend/model"
	"github.com/getline-network/getline/metabackend/util"
	"github.com/getline-network/getline/pb"
	"github.com/golang/glog"
)

func protoABIFunction(entry deployments.JSONABIEntry) *pb.ABIFunction {
	function_type := map[string]pb.ABIFunction_Type{
		"":            pb.ABIFunction_FUNCTION,
		"function":    pb.ABIFunction_FUNCTION,
		"constructor": pb.ABIFunction_CONSTRUCTOR,
		"fallback":    pb.ABIFunction_FALLBACK,
	}[entry.Type]
	inputs, outputs := []*pb.ABIFunction_InputOutput{}, []*pb.ABIFunction_InputOutput{}
	for _, input := range entry.Inputs {
		inputs = append(inputs, &pb.ABIFunction_InputOutput{
			Name: input.Name,
			Type: input.Type,
		})
	}
	for _, output := range entry.Outputs {
		outputs = append(outputs, &pb.ABIFunction_InputOutput{
			Name: output.Name,
			Type: output.Type,
		})
	}
	return &pb.ABIFunction{
		Type:     function_type,
		Name:     entry.Name,
		Inputs:   inputs,
		Outputs:  outputs,
		Constant: entry.Constant,
		Payable:  entry.Payable,
	}
}

func protoABIEvent(entry deployments.JSONABIEntry) *pb.ABIEvent {
	inputs := []*pb.ABIEvent_Input{}
	for _, input := range entry.Inputs {
		inputs = append(inputs, &pb.ABIEvent_Input{
			Name:    input.Name,
			Type:    input.Type,
			Indexed: input.Indexed,
		})
	}
	return &pb.ABIEvent{
		Name:      entry.Name,
		Inputs:    inputs,
		Anonymous: entry.Anonymous,
	}
}

// protoABI returns a proto ABI type for a given internal ABI representation.
func protoABI(abi deployments.JSONABI) *pb.ABI {
	jsonData, _ := json.Marshal(abi)
	functions, events := []*pb.ABIFunction{}, []*pb.ABIEvent{}

	for _, entry := range abi {
		is_function, _ := entry.IsFunction()
		if is_function {
			functions = append(functions, protoABIFunction(entry))
		} else {
			events = append(events, protoABIEvent(entry))
		}
	}

	res := &pb.ABI{
		Json:      jsonData,
		Functions: functions,
		Events:    events,
	}
	return res
}

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
			Abi:          protoABI(contract.ABI),
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

	query := model.LoanMetadataQuery{
		Network: network.ID,
	}
	if req.GetOwner() != nil {
		owner, err := util.ProtoAddressDecode(req.GetOwner())
		if err != nil {
			return nil, fmt.Errorf("invalid owner specified: %v", err)
		}
		query.Borrower = &owner
	}
	if req.GetShortId() != "" {
		query.ShortID = req.GetShortId()
	}

	loans, err := query.Run(ctx, s.Model)
	if err != nil {
		glog.Errorf("LoanMetadataQuery: %v", err)
		return nil, fmt.Errorf("could not get loans")
	}

	cache := make([]*pb.LoanCache, len(loans))
	errors := make(chan error, len(loans))
	wg := sync.WaitGroup{}
	for i, loan := range loans {
		wg.Add(1)
		go func(loan *model.LoanMetadata) {
			defer wg.Done()

			parameters, err := s.Model.GetLoanParameters(ctx, network.ID, *loan.DeployedAddress)
			if err != nil {
				errors <- err
				return
			}
			c := pb.LoanCache{
				Owner:             util.ProtoAddress(loan.Borrower.Hex()),
				DeploymentAddress: util.ProtoAddress(loan.DeployedAddress.Hex()),
				ShortId:           loan.ShortID,
				Parameters:        parameters.Proto(),
				DeploymentState:   pb.LoanCache_DEPLOYED,
			}
			cache[i] = &c
		}(&loan)
	}
	wg.Wait()
	close(errors)

	failed := false
	for err := range errors {
		glog.Error("Could not get loan parameters: %v", err)
		failed = true
	}

	if failed {
		return nil, fmt.Errorf("internal error")
	}

	res := &pb.GetLoansResponse{
		NetworkId: network.ID,
		LoanCache: cache,
	}
	return res, nil
}

func (s *Server) IndexLoan(ctx context.Context, req *pb.IndexLoanRequest) (*pb.IndexLoanResponse, error) {
	networkId := req.GetNetworkId()
	network, ok := s.Deployment.Networks[networkId]
	if !ok {
		return nil, fmt.Errorf("no such network ID")
	}

	address, err := util.ProtoAddressDecode(req.GetLoan())
	if err != nil {
		return nil, fmt.Errorf("invalid loan address specified: %v", err)
	}

	existing, err := model.LoanMetadataQuery{
		Network:         network.ID,
		DeployedAddress: &address,
	}.Run(ctx, s.Model)
	if err == nil && len(existing) != 0 {
		return &pb.IndexLoanResponse{
			existing[0].ShortID,
		}, nil
	}

	invalid, err := s.Model.ValidLoan(ctx, network.ID, address)
	if err != nil {
		glog.Errorf("ValidLoan(..., %q, %q): %v", network.ID, address.Hex(), err)
		return nil, fmt.Errorf("internal server error")
	}
	if invalid != "" {
		return nil, fmt.Errorf("invalid loan specified: %s", invalid)
	}

	md := model.NewLoanMetadata(s.Model, network.ID)
	md.Description = req.GetDescription()
	md.DeployedAddress = &address

	err = md.Index(ctx)
	if err != nil {
		glog.Errorf("LoanMetadta.Index(..., %v, %v): %v", network.ID, address.Hex(), err)
		return nil, fmt.Errorf("internal server error")
	}

	res := &pb.IndexLoanResponse{
		md.ShortID,
	}
	return res, nil
}
