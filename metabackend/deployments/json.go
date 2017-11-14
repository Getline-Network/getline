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
	"fmt"
	"strings"
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
