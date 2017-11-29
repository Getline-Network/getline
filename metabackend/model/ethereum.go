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

package model

import (
	"fmt"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/getline-network/getline/pb"
	"golang.org/x/net/context"
)

// blockchainRemote is an access handle to a blockchain network.
type blockchainRemote struct {
	blockchain  bind.ContractBackend
	metabackend pb.MetabackendServer
}

// newBlockchainRemote returna a blockchainRemote for a given geth blockchain
// backend and metabackend server to get ABI definitions from.
func newBlockchainRemote(backend bind.ContractBackend, metabackend pb.MetabackendServer) *blockchainRemote {
	return &blockchainRemote{
		blockchain:  backend,
		metabackend: metabackend,
	}
}

// findContract gets a contract ABI from the metabackend.
func (b *blockchainRemote) findContract(ctx context.Context, networkId string, contractName string) (*pb.Contract, error) {
	req := &pb.GetDeploymentRequest{
		NetworkId: networkId,
	}
	deployment, err := b.metabackend.GetDeployment(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("could not get deployment for network id %q: %v", networkId, err)
	}
	if want, got := deployment.GetNetworkId(), networkId; want != got {
		return nil, fmt.Errorf("expected network %q, got %q", want, got)
	}

	for _, contract := range deployment.GetContract() {
		if contract.GetName() != contractName {
			continue
		}
		return contract, nil
	}
	return nil, fmt.Errorf("no contract %q from metabackend", contractName)
}

// get returns a geth BoundContract for a given contract name and network id.
func (b *blockchainRemote) get(ctx context.Context, networkId, contractName string, address common.Address) (*bind.BoundContract, error) {
	pbc, err := b.findContract(ctx, networkId, contractName)
	if err != nil {
		return nil, fmt.Errorf("when finding contract: %v", err)
	}
	parsed, err := abi.JSON(strings.NewReader(string(pbc.GetAbi().GetJson())))
	if err != nil {
		return nil, fmt.Errorf("when parsing contract abi: %v", err)
	}
	bound := bind.NewBoundContract(address, parsed, b.blockchain, b.blockchain)
	return bound, nil
}

func (b *blockchainRemote) ValidLoan(ctx context.Context, networkId string, address common.Address) (string, error) {
	return "", nil
	//=_, err := b.GetLoan(ctx, network, address)
	//=if err != nil {
	//=	// TODO(q3k): Do not leak error messages to caller.
	//=	return err.Error(), nil
	//=}
	//=// TODO(q3k): Validate if given address contains known loan bytecode.
	//=return "", nil
}
