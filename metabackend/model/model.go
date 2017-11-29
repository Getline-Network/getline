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
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"

	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/getline-network/getline/metabackend/util"
	"github.com/getline-network/getline/pb"
)

var schema = `

CREATE TABLE deployed_loan_parameters (
    network varchar(32) not null,
	version  bigint not null,
	address bytea not null,

	borrowed_token bytea not null,
	collateral_token bytea not null,
	amount_wanted numeric not null,
	borrower bytea not null,
	interest_permil int not null,
	fundraising_blocks_count numeric not null,
	payback_blocks_count numeric not null,

	primary key(network, address)
);

CREATE TABLE loan_metadata (
	loan_metadata_id bigserial,
	shortid varchar(12) not null,

	borrower bytea not null,
	description varchar(800),

	network varchar(32) not null,
	deployed_address bytea not null,

	primary key(loan_metadata_id),
	unique(shortid),
	unique(network, deployed_address)
);
`

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

func (m *Model) Transaction() (*sqlx.Tx, error) {
	return m.dbConn.Beginx()
}

func (m *Model) InitializeSchema() error {
	_, err := m.dbConn.Exec(schema)
	return err
}

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

func (m *Model) NewLoan() *Loan {
	return &Loan{
		model: m,
	}
}
