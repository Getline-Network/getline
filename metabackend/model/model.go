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

	ethcommon "github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/getline-network/getline/metabackend/util"
	"github.com/getline-network/getline/pb"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"golang.org/x/net/context"
)

type Loan struct {
	model *Model

	Parameters struct {
		BorrowedToken          ethcommon.Address
		CollateralToken        ethcommon.Address
		AmountWanted           *big.Int
		Borrower               ethcommon.Address
		InterestPermil         uint16
		FundraisingBlocksCount *big.Int
		PaybackBlocksCount     *big.Int
	}
	Metadata struct {
		NetworkID       string
		ShortID         string
		Borrower        ethcommon.Address
		Description     string
		DeployedAddress ethcommon.Address
	}
}

func (d *Loan) ProtoParameters() *pb.LoanParameters {
	res := pb.LoanParameters{
		CollateralToken:        util.ProtoAddress(d.Parameters.CollateralToken.Hex()),
		LoanToken:              util.ProtoAddress(d.Parameters.BorrowedToken.Hex()),
		Liege:                  util.ProtoAddress(d.Parameters.Borrower.Hex()),
		AmountWanted:           d.Parameters.AmountWanted.String(),
		InterestPermil:         uint32(d.Parameters.InterestPermil),
		FundraisingBlocksCount: d.Parameters.FundraisingBlocksCount.String(),
		PaybackBlocksCount:     d.Parameters.PaybackBlocksCount.String(),
	}
	return &res
}

type Model struct {
	dbConn      *sqlx.DB
	metabackend pb.MetabackendServer
	blockchain  *blockchainRemote
}

func New(driverName, dataSourceName, ethRemote string, server pb.MetabackendServer) (*Model, error) {
	// TODO(q3k): one eth backend per networkid.
	backend, err := ethclient.Dial(ethRemote)
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

func (m *Model) NewLoan() *Loan {
	return &Loan{
		model: m,
	}
}

func (m *Model) Transaction() (*sqlx.Tx, error) {
	return m.dbConn.Beginx()
}

func (l *Loan) LoadParametersFromBlockchain(ctx context.Context) error {
	loanContract, err := l.model.blockchain.get(ctx, l.Metadata.NetworkID, "Loan", l.Metadata.DeployedAddress)
	if err != nil {
		return fmt.Errorf("getting Loan contract failed: %v", err)
	}

	errs := []error{}
	errs = append(errs, loanContract.Call(nil, &l.Parameters.BorrowedToken, "borrowedToken"))
	errs = append(errs, loanContract.Call(nil, &l.Parameters.CollateralToken, "collateralToken"))
	errs = append(errs, loanContract.Call(nil, &l.Parameters.AmountWanted, "amountWanted"))
	errs = append(errs, loanContract.Call(nil, &l.Parameters.Borrower, "borrower"))
	errs = append(errs, loanContract.Call(nil, &l.Parameters.InterestPermil, "interestPermil"))
	errs = append(errs, loanContract.Call(nil, &l.Parameters.FundraisingBlocksCount, "fundraisingBlocksCount"))
	errs = append(errs, loanContract.Call(nil, &l.Parameters.PaybackBlocksCount, "paybackBlocksCount"))
	for _, err := range errs {
		if err != nil {
			return fmt.Errorf("calling getter failed: %v", err)
		}
	}

	return nil
}
