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

// Simple linker for contract bytecode in a given network.

import (
	"fmt"
	"strings"

	"github.com/golang/glog"
)

// unlinked returns whether the contract has been succesfully linked already.
func (c *Contract) unlinked() bool {
	return c.LinkedBinary == ""
}

// unlinked returns all unlinked contracts in a network.
func (n *Network) unlinked() []string {
	res := []string{}
	for _, lc := range n.Contracts {
		if lc.unlinked() {
			res = append(res, lc.Name)
		}
	}
	return res
}

// tryMakeLinked iterates over all contracts and marks them as linked if their
// bytecode has no unresolved dependencies.
func (n *Network) tryMakeLinked(contractName string) {
	c := n.Contracts[contractName]
	if strings.Contains(c.UnlinkedBinary, "_") {
		return
	}
	glog.Infof("Linked %q on network %q", contractName, n.ID)
	c.LinkedBinary = c.UnlinkedBinary
}

// resolveDependencies will resolve all possible dependencies for a given
// contract.
func (n *Network) resolveDependencies(contractName string) {
	c := n.Contracts[contractName]
	if !strings.Contains(c.UnlinkedBinary, "_") {
		return
	}
	glog.Infof("Resolving dependencies for %q...", c.Name)
	for dependencyName, address := range c.Networks[n.ID].Links {
		dependency, ok := n.Contracts[dependencyName]
		if !ok {
			glog.Warningf("Dependency %q not on network!", dependencyName)
			continue
		}
		if other, us := dependency.Networks[n.ID].Address, address; other != us {
			glog.Warningf("Dependency %q claims to be on %q, dependent claims it's on %q", other, us)
			continue
		}
		key := "__" + dependencyName
		key = key + strings.Repeat("_", 40-len(key))
		if !strings.Contains(c.UnlinkedBinary, key) {
			glog.Warningf("Contract should depend on %q but no key (%q) found", dependencyName, key)
			continue
		}
		glog.Infof("Resolved dependency %q in %q to %q", dependencyName, c.Name, address)
		addressNoPrefix := strings.TrimPrefix(address, "0x")
		c.UnlinkedBinary = strings.Replace(c.UnlinkedBinary, key, addressNoPrefix, -1)
	}
}

// link iterates over all unlinked contracts until they are linked or no more
// progress can be made.
func (n *Network) link() error {
	prevUnlinkedCount := len(n.unlinked())
	for {
		glog.Infof("Network %q: %d unlinked left...", n.ID, prevUnlinkedCount)

		// Make all unlinked contracts with no dependencies linked.
		for contractName, contract := range n.Contracts {
			if !contract.unlinked() {
				continue
			}
			n.tryMakeLinked(contractName)
		}

		// Resolve dependencies.
		for contractName, contract := range n.Contracts {
			if !contract.unlinked() {
				continue
			}
			n.resolveDependencies(contractName)
		}

		if curUnlinkedCount := len(n.unlinked()); curUnlinkedCount == prevUnlinkedCount {
			unlinked := []string{}
			for _, contract := range n.Contracts {
				if contract.unlinked() {
					unlinked = append(unlinked, contract.Name)
				}
			}
			glog.Infof("Network %q done at %v unlinked: %s", n.ID, curUnlinkedCount, strings.Join(unlinked, ", "))
			return nil
		}
		prevUnlinkedCount = len(n.unlinked())
		if prevUnlinkedCount == 0 {
			break
		}
	}
	return nil
}

// linkAll iterates over all networks in a deployment and links their
// contracts, if possible.
func (d *Deployment) linkAll() error {
	// Create a network for all networks in sources.
	for _, source := range d.Sources {
		for id, _ := range source.Networks {
			if d.Networks[id] != nil {
				continue
			}
			glog.Infof("Found network ID %q", id)
			d.Networks[id] = &Network{
				ID:        id,
				Contracts: make(map[string]*Contract),
			}
		}
	}

	// Include all contracts into all networks (ones that can't be linked or
	// are absent from a given network will be removed in later passes).
	for _, network := range d.Networks {
		for _, source := range d.Sources {
			linkedContract := Contract{
				JSONContract: *source,
			}
			network.Contracts[linkedContract.Name] = &linkedContract
		}
	}

	// Link contracts in each network.
	for _, network := range d.Networks {
		err := network.link()
		if err != nil {
			return fmt.Errorf("while linking network %q: %v", network.ID, err)
		}
	}

	// Log network/contract mapping.
	for _, network := range d.Networks {
		deployedNames := []string{}
		linkedNames := []string{}
		abiOnlyNames := []string{}
		for _, lc := range network.Contracts {
			if lc.unlinked() {
				abiOnlyNames = append(abiOnlyNames, lc.Name)
			} else {
				if lc.GetAddress(network.ID) != "" {
					deployedNames = append(deployedNames, lc.Name)
				} else {
					linkedNames = append(linkedNames, lc.Name)
				}
			}
		}
		glog.Infof("Network %q has deployed contracts %q, linked contracts %q, ABI-only contracts %q", network.ID, deployedNames, linkedNames, abiOnlyNames)
	}

	return nil
}
