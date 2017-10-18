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
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sort"
	"strings"

	"golang.org/x/net/context"

	"github.com/getline-network/getline/metabackend/deployments"
	"github.com/getline-network/getline/metabackend/pb"
)

// protoAddress returns a proto address from a given 0x-prefixed string
// representation. It does not perform any other sanity checks and is meant to
// only be used in rendering.
func protoAddress(ascii string) *pb.Address {
	if ascii == "" {
		return &pb.Address{
			Raw:   []byte(""),
			Ascii: "",
		}
	}
	ascii = strings.TrimPrefix(ascii, "0x")
	raw, err := hex.DecodeString(ascii)
	if err != nil {
		return nil
	}
	return &pb.Address{
		Raw:   raw,
		Ascii: "0x" + ascii,
	}
}

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
type server struct {
	deployment *deployments.Deployment
}

func (s server) GetDeployment(ctx context.Context, req *pb.GetDeploymentRequest) (*pb.GetDeploymentResponse, error) {
	networkId := req.GetNetworkId()
	network, ok := s.deployment.Networks[networkId]
	if !ok {
		return nil, fmt.Errorf("no such network ID")
	}

	res := &pb.GetDeploymentResponse{
		NetworkId: network.ID,
	}
	for _, contract := range network.Contracts {
		pbc := &pb.Contract{
			Name:         contract.Name,
			Address:      protoAddress(contract.GetAddress(networkId)),
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
