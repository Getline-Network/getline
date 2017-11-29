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

package deployments

// JSON schema and validators for Truffle build artifacts.

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/getline-network/getline/pb"
)

type JSONABIIO struct {
	Name    string `json:"name"`
	Type    string `json:"type"`
	Indexed bool   `json:"indexed"`
}

type JSONABIEntry struct {
	Type      string      `json:"type"`
	Name      string      `json:"name"`
	Inputs    []JSONABIIO `json:"inputs"`
	Outputs   []JSONABIIO `json:"outputs"`
	Constant  bool        `json:"constant"`
	Payable   bool        `json:"payable"`
	Anonymous bool        `json:"anonymous"`
}

type JSONABI []JSONABIEntry

type JSONContract struct {
	Name           string                 `json:"contractName"`
	UnlinkedBinary string                 `json:"bytecode"`
	Networks       map[string]JSONNetwork `json:"networks"`
	SchemaVersion  string                 `json:"schemaVersion"`
	ABI            JSONABI                `json:"abi"`
}

type JSONNetwork struct {
	Address string            `json:"address"`
	Links   map[string]string `json:"links"`
}

func (e *JSONABIEntry) ValidFunction() error {
	if e.Name == "" && e.Type != "constructor" {
		return fmt.Errorf("name is empty")
	}
	for i, input := range e.Inputs {
		// A one-arity function with an unnamed parameter is valid as a map
		// getter.
		if input.Name == "" && len(e.Inputs) > 1 {
			return fmt.Errorf("%dth input name is empty", i)
		}
		if input.Type == "" {
			return fmt.Errorf("%dth input type is empty", i)
		}
	}
	for i, output := range e.Outputs {
		// A function can return an unnamed variable if it's return arity is
		// one.
		if output.Name == "" && len(e.Outputs) > 1 {
			return fmt.Errorf("%dth output name is empty", i)
		}
		if output.Type == "" {
			return fmt.Errorf("%dth output type is empty", i)
		}
	}
	return nil
}

func (e *JSONABIEntry) ValidEvent() error {
	if e.Name == "" {
		return fmt.Errorf("name is empty")
	}
	for i, input := range e.Inputs {
		if input.Name == "" {
			return fmt.Errorf("%dth input name is empty", i)
		}
		if input.Type == "" {
			return fmt.Errorf("%dth input type is empty", i)
		}
	}
	return nil
}

func (e *JSONABIEntry) IsFunction() (bool, error) {
	function_signatures := map[string]bool{
		"":         true, // By default ABI entries are functions.
		"function": true, "constructor": true, "fallback": true,
	}
	if function_signatures[e.Type] {
		return true, nil
	} else if e.Type == "event" {
		return false, nil
	}
	return false, fmt.Errorf("unknown type %q", e.Type)
}

func (a JSONABI) Valid() error {
	for i, entry := range a {
		var err error
		is_function, err := entry.IsFunction()
		if err == nil {
			if is_function {
				err = entry.ValidFunction()
			} else {
				err = entry.ValidEvent()
			}
		}

		if err != nil {
			return fmt.Errorf("%dth entry: err", i, err)
		}
	}
	return nil
}

func (c *JSONContract) Valid() error {
	if want, got := "1.0.1", c.SchemaVersion; want != got {
		return fmt.Errorf("schema_version must be %q, is %q", want, got)
	}
	if c.Name == "" {
		return fmt.Errorf("contract_name needs to be set")
	}
	if !strings.HasPrefix(c.UnlinkedBinary, "0x") {
		return fmt.Errorf("unlinked_binary needs to be a hex-encoded binary")
	}
	if err := c.ABI.Valid(); err != nil {
		return fmt.Errorf("abi invalid: %v", err)
	}
	return nil
}

func (e JSONABIEntry) ProtoFunction() *pb.ABIFunction {
	function_type := map[string]pb.ABIFunction_Type{
		"":            pb.ABIFunction_FUNCTION,
		"function":    pb.ABIFunction_FUNCTION,
		"constructor": pb.ABIFunction_CONSTRUCTOR,
		"fallback":    pb.ABIFunction_FALLBACK,
	}[e.Type]
	inputs, outputs := []*pb.ABIFunction_InputOutput{}, []*pb.ABIFunction_InputOutput{}
	for _, input := range e.Inputs {
		inputs = append(inputs, &pb.ABIFunction_InputOutput{
			Name: input.Name,
			Type: input.Type,
		})
	}
	for _, output := range e.Outputs {
		outputs = append(outputs, &pb.ABIFunction_InputOutput{
			Name: output.Name,
			Type: output.Type,
		})
	}
	return &pb.ABIFunction{
		Type:     function_type,
		Name:     e.Name,
		Inputs:   inputs,
		Outputs:  outputs,
		Constant: e.Constant,
		Payable:  e.Payable,
	}
}

func (e JSONABIEntry) ProtoEvent() *pb.ABIEvent {
	inputs := []*pb.ABIEvent_Input{}
	for _, input := range e.Inputs {
		inputs = append(inputs, &pb.ABIEvent_Input{
			Name:    input.Name,
			Type:    input.Type,
			Indexed: input.Indexed,
		})
	}
	return &pb.ABIEvent{
		Name:      e.Name,
		Inputs:    inputs,
		Anonymous: e.Anonymous,
	}
}

// protoABI returns a proto ABI type for a given internal ABI representation.
func (a JSONABI) Proto() *pb.ABI {
	jsonData, _ := json.Marshal(a)
	functions, events := []*pb.ABIFunction{}, []*pb.ABIEvent{}

	for _, entry := range a {
		is_function, _ := entry.IsFunction()
		if is_function {
			functions = append(functions, entry.ProtoFunction())
		} else {
			events = append(events, entry.ProtoEvent())
		}
	}

	res := &pb.ABI{
		Json:      jsonData,
		Functions: functions,
		Events:    events,
	}
	return res
}
