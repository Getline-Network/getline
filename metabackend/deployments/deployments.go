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
	"fmt"
	"io/ioutil"
	"path/filepath"
	"strings"

	"github.com/golang/glog"
)

const (
	contractsDirectory = "build/contracts"
)

// Contract is an Ethereum contract that has been validated by the server.
type Contract struct {
	JSONContract
	LinkedBinary string
}

// GetAddress gets the address of a contract on a given network, if the
// contract is a singleton deployed there.
func (c *Contract) GetAddress(networkId string) string {
	network, ok := c.Networks[networkId]
	if !ok {
		return ""
	}
	return network.Address
}

// Network represents a blockchain on which contracts have been deployed.
type Network struct {
	ID        string
	Contracts map[string]*Contract
}

// Deployment is a collection of JSON source files and networks that contain
// their artifacts.
type Deployment struct {
	Sources  map[string]*JSONContract
	Networks map[string]*Network
}

// FromFilesystem loads, parses and validates the build artifacts of a
// Truffle-like project.
func FromFilesystem(root string) (*Deployment, error) {
	contractsPath := filepath.Join(root, contractsDirectory)
	files, err := ioutil.ReadDir(contractsPath)
	if err != nil {
		return nil, fmt.Errorf("while listing directory %q: %v", contractsPath, err)
	}

	d := &Deployment{
		Sources:  make(map[string]*JSONContract),
		Networks: make(map[string]*Network),
	}

	for _, file := range files {
		if !strings.HasSuffix(file.Name(), ".json") {
			glog.Info("Skipping non-contract file %q", file.Name())
			continue
		}
		path := filepath.Join(contractsPath, file.Name())
		data, err := ioutil.ReadFile(path)
		if err != nil {
			glog.Errorf("Could not read contract file %q: %v", path, err)
			continue
		}
		contract := JSONContract{}
		err = json.Unmarshal(data, &contract)
		if err != nil {
			glog.Errorf("Could not unmarshal contract file %q: %v", path, err)
			continue
		}
		if err = contract.Valid(); err != nil {
			glog.Errorf("Could not validate contract file %q: %v", path, err)
			continue
		}
		glog.Infof("Loaded contract %v", contract.Name)
		d.Sources[contract.Name] = &contract
	}

	err = d.linkAll()
	if err != nil {
		return nil, err
	}
	return d, nil
}
