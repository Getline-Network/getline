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
	"strings"

	ethcommon "github.com/ethereum/go-ethereum/common"
	"github.com/teris-io/shortid"
	"golang.org/x/net/context"
)

// This file contains the actual SQL schema, mapped types and conversion
// methods.

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
	unique(deployed_address)
);
`

func (m *Model) InitializeSchema() error {
	_, err := m.dbConn.Exec(schema)
	return err
}

// tableDeployedLoanParameters is a dumb cache of the parameters of a Loan
// contract on the blockchain.
type tableDeployedLoanParameters struct {
	Version int64  `db:"version"`
	Network string `db:"network"`
	Address []byte `db:"address"`

	BorrowedToken          []byte `db:"borrowed_token"`
	CollateralToken        []byte `db:"collateral_token"`
	AmountWanted           string `db:"amount_wanted"`
	Borrower               []byte `db:"borrower"`
	InterestPermil         uint16 `db:"interest_permil"`
	FundraisingBlocksCount string `db:"fundraising_blocks_count"`
	PaybackBlocksCount     string `db:"payback_blocks_count"`
}

// Object returns an application-level DeployedLoanParameters from a
// tableDeployedLoanParameters.
func (t *tableDeployedLoanParameters) Object(m *Model) (*DeployedLoanParameters, error) {
	var amountWanted, fundraisingBlocksCount, paybackBlocksCount *big.Int
	var ok bool

	if amountWanted, ok = new(big.Int).SetString(t.AmountWanted, 10); !ok {
		return nil, fmt.Errorf("invalid amount_wanted value")
	}
	if fundraisingBlocksCount, ok = new(big.Int).SetString(t.FundraisingBlocksCount, 10); !ok {
		return nil, fmt.Errorf("invalid fundraising_blocks_count value")
	}
	if paybackBlocksCount, ok = new(big.Int).SetString(t.PaybackBlocksCount, 10); !ok {
		return nil, fmt.Errorf("invalid payback_blocks_count value")
	}

	return &DeployedLoanParameters{
		BorrowedToken:          ethcommon.BytesToAddress(t.BorrowedToken),
		CollateralToken:        ethcommon.BytesToAddress(t.CollateralToken),
		Borrower:               ethcommon.BytesToAddress(t.Borrower),
		InterestPermil:         t.InterestPermil,
		AmountWanted:           amountWanted,
		FundraisingBlocksCount: fundraisingBlocksCount,
		PaybackBlocksCount:     paybackBlocksCount,
	}, nil
}

func (m *Model) GetDeployedLoanParametersByAddress(ctx context.Context, networkId string, address ethcommon.Address) (*tableDeployedLoanParameters, error) {
	dest := []tableDeployedLoanParameters{}
	err := m.dbConn.SelectContext(ctx, &dest, "SELECT * FROM deployed_loan_parameters where network = $1 and version = $2 and address = $3 LIMIT 1", networkId, 0, address.Bytes())
	if err != nil {
		return nil, fmt.Errorf("when loading loan parameters from database: %v", err)
	}
	if len(dest) != 1 {
		return nil, nil
	}

	return &dest[0], nil
}

// tableLoanMetadata is the description of an indexed Loan that we serve to
// clients.
type tableLoanMetadata struct {
	Network         string `db:"network"`
	ID              int64  `db:"loan_metadata_id"`
	ShortID         string `db:"shortid"`
	Borrower        []byte `db:"borrower"`
	Description     string `db:"description"`
	DeployedAddress []byte `db:"deployed_address"`
}

// Object returns an application-level LoanMetadata from a tableLoanMetadata.
func (t *tableLoanMetadata) Object(m *Model) (*LoanMetadata, error) {
	if t.Network == "" {
		return nil, fmt.Errorf("Network not set")
	}
	if t.ShortID == "" {
		return nil, fmt.Errorf("ShortID not set")
	}
	if len(t.Borrower) == 0 {
		return nil, fmt.Errorf("Borrower not set")
	}
	if len(t.DeployedAddress) == 0 {
		return nil, fmt.Errorf("DeployedAddress not set")
	}
	deployed := ethcommon.BytesToAddress(t.DeployedAddress)
	return &LoanMetadata{
		model:           m,
		network:         t.Network,
		ShortID:         t.ShortID,
		Borrower:        ethcommon.BytesToAddress(t.Borrower),
		Description:     t.Description,
		DeployedAddress: &deployed,
	}, nil
}

type LoanMetadataQuery struct {
	Network         string
	ShortID         string
	Borrower        *ethcommon.Address
	DeployedAddress *ethcommon.Address
}

func (q LoanMetadataQuery) Run(ctx context.Context, m *Model) ([]LoanMetadata, error) {
	data := []tableLoanMetadata{}
	query := "SELECT * FROM loan_metadata"
	keys := []string{}
	args := []interface{}{}

	if q.Network != "" {
		keys = append(keys, "network")
		args = append(args, q.Network)
	}
	if q.DeployedAddress != nil {
		keys = append(keys, "deployed_address")
		args = append(args, q.DeployedAddress.Bytes())
	}
	if q.Borrower != nil {
		keys = append(keys, "borrower")
		args = append(args, q.Borrower.Bytes())
	}
	if q.ShortID != "" {
		keys = append(keys, "shortID")
		args = append(args, q.ShortID)
	}

	where := []string{}
	for i, key := range keys {
		where = append(where, fmt.Sprintf("%s = $%d", key, i+1))
	}
	if len(keys) != 0 {
		query = query + " WHERE " + strings.Join(where, " AND ")
	}

	err := m.dbConn.SelectContext(ctx, &data, query, args...)
	if err != nil {
		return []LoanMetadata{}, err
	}

	res := []LoanMetadata{}
	for _, table := range data {
		obj, err := table.Object(m)
		if err != nil {
			return []LoanMetadata{}, err
		}
		res = append(res, *obj)
	}

	return res, nil
}

// TODO(q3k): refactor this to operate on the table struct instead
func (d *LoanMetadata) Index(ctx context.Context) error {
	if d.model == nil {
		return fmt.Errorf("LoanMetadata has no model attached")
	}
	if d.network == "" {
		return fmt.Errorf("LoanMetadata has no network specified")
	}
	if d.DeployedAddress == nil {
		return fmt.Errorf("LoanMetadata has no deployed address specified")
	}
	if d.ShortID != "" {
		return fmt.Errorf("LoanMetadata has ShortID set")
	}

	parameters, err := d.model.GetLoanParameters(ctx, d.network, *d.DeployedAddress)
	if err != nil {
		return fmt.Errorf("could not load loan parameters: %v", err)
	}

	tx, err := d.model.dbConn.Beginx()
	if err != nil {
		return err
	}

	// Generate unique shortID, ensure it's not duplicate in the database.
	// This is somewhat hacky, even with the guarantees of the shortid library
	// that we use.
	tries := 0
	shortID := ""
	for {
		tries += 1
		if tries > 10 {
			tx.Rollback()
			return fmt.Errorf("could not generate shortid: %v", err)
		}

		shortID, err = shortid.Generate()
		if err != nil {
			continue
		}
		var count int
		err = tx.GetContext(ctx, &count, "SELECT COUNT(*) FROM loan_metadata WHERE shortid = $1", shortID)
		if err != nil {
			continue
		}
		if count == 0 {
			break
		}
	}

	_, err = tx.ExecContext(ctx, `
INSERT INTO loan_metadata (
	shortid, borrower, description, network, deployed_address
) VALUES (
	$1, $2, $3, $4, $5 
)`, shortID, parameters.Borrower.Bytes(), d.Description, d.network, d.DeployedAddress.Bytes())
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("could not insert loan metadata: %v", err)
	}

	d.ShortID = shortID
	return tx.Commit()
}

// TODO(q3k): refactor this to operate on the table struct instead
func (d *DeployedLoanParameters) saveToDatabase(ctx context.Context) error {
	t := tableDeployedLoanParameters{
		Network: d.network,
		Version: 0,
		Address: d.address.Bytes(),

		BorrowedToken:          d.BorrowedToken.Bytes(),
		CollateralToken:        d.CollateralToken.Bytes(),
		AmountWanted:           d.AmountWanted.String(),
		Borrower:               d.Borrower.Bytes(),
		InterestPermil:         d.InterestPermil,
		FundraisingBlocksCount: d.FundraisingBlocksCount.String(),
		PaybackBlocksCount:     d.PaybackBlocksCount.String(),
	}
	_, err := d.model.dbConn.NamedExecContext(ctx, `
INSERT INTO deployed_loan_parameters (
	network, version, address,
	borrowed_token, collateral_token, amount_wanted, borrower, interest_permil, fundraising_blocks_count, payback_blocks_count
) VALUES (
	:network, :version, :address,
	:borrowed_token, :collateral_token, :amount_wanted, :borrower, :interest_permil, :fundraising_blocks_count, :payback_blocks_count
)`, t)
	return err
}
