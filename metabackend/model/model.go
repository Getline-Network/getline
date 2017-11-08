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
	"math/big"

	"golang.org/x/net/context"

	ethcommon "github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/getline-network/getline/metabackend/util"
	"github.com/getline-network/getline/pb"
	"github.com/golang/glog"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type DeployedLoanParameters struct {
	model   *Model
	network string
	address ethcommon.Address

	BorrowedToken          ethcommon.Address
	CollateralToken        ethcommon.Address
	AmountWanted           *big.Int
	Borrower               ethcommon.Address
	InterestPermil         uint16
	FundraisingBlocksCount *big.Int
	PaybackBlocksCount     *big.Int
}

func (d *DeployedLoanParameters) Proto() *pb.LoanParameters {
	res := pb.LoanParameters{
		CollateralToken:        util.ProtoAddress(d.CollateralToken.Hex()),
		LoanToken:              util.ProtoAddress(d.BorrowedToken.Hex()),
		Liege:                  util.ProtoAddress(d.Borrower.Hex()),
		AmountWanted:           d.AmountWanted.String(),
		InterestPermil:         uint32(d.InterestPermil),
		FundraisingBlocksCount: d.FundraisingBlocksCount.String(),
		PaybackBlocksCount:     d.PaybackBlocksCount.String(),
	}
	return &res
}

type LoanMetadata struct {
	model   *Model
	network string

	ShortID         string
	Borrower        ethcommon.Address
	Description     string
	DeployedAddress *ethcommon.Address
}

func NewLoanMetadata(model *Model, network string) *LoanMetadata {
	return &LoanMetadata{
		model:   model,
		network: network,
	}
}

type Model struct {
	dbConn      *sqlx.DB
	metabackend pb.MetabackendServer
	blockchain  *blockchainRemote
}

func New(driverName, dataSourceName string, server pb.MetabackendServer) (*Model, error) {
	backend, err := ethclient.Dial("http://localhost:8545")
	if err != nil {
		return nil, fmt.Errorf("connecting to blockchain failed: %v", err)
	}
	db, err := sqlx.Connect(driverName, dataSourceName)
	if err != nil {
		return nil, fmt.Errorf("connecting to database failed: %v", err)
	}

	m := &Model{
		dbConn:      db,
		metabackend: server,
		blockchain: &blockchainRemote{
			blockchain:  backend,
			metabackend: server,
		},
	}
	return m, nil
}

// TODO(q3k): Refactor this into the query-struct style.
func (m *Model) GetLoanParameters(ctx context.Context, network string, address ethcommon.Address) (*DeployedLoanParameters, error) {
	// Try to load from database.
	data, err := m.GetDeployedLoanParametersByAddress(ctx, network, address)
	if err != nil {
		glog.Warningf("Couldn't load loan from database: %v", err)
	}
	if data != nil {
		return data.Object(m)
	}

	// Since that failed, try to load it from the blockchain.
	obj, err := m.blockchain.GetLoan(ctx, network, address)
	if err != nil {
		return nil, fmt.Errorf("loading from blockchain failed: %v", err)
	}

	// Save to database for cache.
	err = obj.saveToDatabase(ctx)
	if err != nil {
		glog.Warningf("Saving loan to database failed: %v", err)
	}

	return obj, nil
}

func (m *Model) ValidLoan(ctx context.Context, network string, address ethcommon.Address) (string, error) {
	_, err := m.blockchain.GetLoan(ctx, network, address)
	if err != nil {
		// TODO(q3k): Do not leak error messages to caller.
		return err.Error(), nil
	}
	// TODO(q3k): Validate if given address contains known loan bytecode.
	return "", nil
}
