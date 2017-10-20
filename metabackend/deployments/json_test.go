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

import (
	"encoding/json"
	"testing"

	"github.com/go-test/deep"
)

func TestValidJSON(t *testing.T) {
	data := []struct {
		description string
		input       string
		expect      *JSONContract
	}{
		{
			description: "Minimal case",
			input:       `{"contract_name": "Foo", "schema_version": "0.0.5", "unlinked_binary": "0x00"}`,
			expect:      &JSONContract{Name: "Foo", SchemaVersion: "0.0.5", UnlinkedBinary: "0x00"},
		},
		{
			description: "Minimal case with ABI",
			input: `{
					"contract_name": "Foo", "schema_version": "0.0.5", "unlinked_binary": "0x00",
					"abi": [
							{"type": "constructor", "name": ""},
							{"type": "function", "name": "bar", "inputs": [{"name": "a", "type": "A"}]},
							{"type": "function", "name": "baz", "outputs": [{"type": "B"}]},
							{"type": "event", "name": "barfoo", "inputs": [{"name": "c", "type": "C", "indexed": true}]}
					]
			}`,
			expect: &JSONContract{
				Name: "Foo", SchemaVersion: "0.0.5", UnlinkedBinary: "0x00",
				ABI: []JSONABIEntry{
					{
						Type: "constructor", Name: "", Constant: false, Payable: false,
					},
					{
						Type: "function", Name: "bar", Constant: false, Payable: false,
						Inputs: []JSONABIIO{{Name: "a", Type: "A"}},
					},
					{
						Type: "function", Name: "baz", Constant: false, Payable: false,
						Outputs: []JSONABIIO{{Type: "B"}},
					},
					{
						Type: "event", Name: "barfoo",
						Inputs: []JSONABIIO{{Name: "c", Type: "C", Indexed: true}},
					},
				},
			},
		},
	}

	for _, test_case := range data {
		out := &JSONContract{}
		err := json.Unmarshal([]byte(test_case.input), out)
		if err != nil {
			t.Errorf("%s: could not decode JSON: %v", test_case.description, err)
			continue
		}
		if diff := deep.Equal(out, test_case.expect); diff != nil {
			t.Errorf("%s: did not decode to expected structure: %v", test_case.description, diff)
			continue
		}
		if err = out.Valid(); err != nil {
			t.Errorf("%s: is invalid, should be valid: %v", test_case.description, err)
		}
	}
}

func TestInvalidJSON(t *testing.T) {
	data := []struct {
		description string
		input       string
	}{
		{
			description: "Invalid schema version",
			input:       `{"contract_name": "Foo", "schema_version": "1.0.0", "unlinked_binary": "0x00"}`,
		},
		{
			description: "Invalid unlinked binary",
			input:       `{"contract_name": "Foo", "schema_version": "0.0.5", "unlinked_binary": "deadbeef"}`,
		},
		{
			description: "Empty contract name",
			input:       `{"contract_name": "", "schema_version": "0.0.5", "unlinked_binary": "0x00"}`,
		},
		{
			description: "Invalid entry type",
			input: `{"contract_name": "Foo", "schema_version": "0.0.5", "unlinked_binary": "0x00",
                     "abi": [{"type": "method", "name": "legit"}]}`,
		},
		{
			description: "Empty function name",
			input: `{"contract_name": "Foo", "schema_version": "0.0.5", "unlinked_binary": "0x00",
                     "abi": [{"type": "function", "name": ""}]}`,
		},
		{
			description: "Empty function input type",
			input: `{"contract_name": "Foo", "schema_version": "0.0.5", "unlinked_binary": "0x00",
                     "abi": [{"type": "function", "name": "legit", "inputs": [{"name": "a"}]}]}`,
		},
		{
			description: "Empty function output type",
			input: `{"contract_name": "Foo", "schema_version": "0.0.5", "unlinked_binary": "0x00",
                     "abi": [{"type": "function", "name": "legit", "outputs": [{"name": "a"}]}]}`,
		},
		{
			description: "Empty function input name",
			input: `{"contract_name": "Foo", "schema_version": "0.0.5", "unlinked_binary": "0x00",
                     "abi": [{"type": "function", "name": "legit", "inputs": [{"type": "A"}, {"type": "B"}]}]}`,
		},
		{
			description: "Empty function output name",
			input: `{"contract_name": "Foo", "schema_version": "0.0.5", "unlinked_binary": "0x00",
                     "abi": [{"type": "function", "name": "legit", "outputs": [{"type": "A"}, {"type": "B"}]}]}`,
		},
		{
			description: "Empty event input type",
			input: `{"contract_name": "Foo", "schema_version": "0.0.5", "unlinked_binary": "0x00",
                     "abi": [{"type": "event", "name": "legit", "inputs": [{"name": "a"}]}]}`,
		},
		{
			description: "Empty event input name",
			input: `{"contract_name": "Foo", "schema_version": "0.0.5", "unlinked_binary": "0x00",
                     "abi": [{"type": "event", "name": "legit", "inputs": [{"type": "A"}]}]}`,
		},
	}

	for _, test_case := range data {
		out := &JSONContract{}
		err := json.Unmarshal([]byte(test_case.input), out)
		if err != nil {
			t.Errorf("%s: could not decode JSON: %v", test_case.description, err)
			continue
		}
		if err = out.Valid(); err == nil {
			t.Errorf("%s: is valid, should be invalid", test_case.description)
		}
	}
}
