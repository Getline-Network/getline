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
	"sync"

	ethcommon "github.com/ethereum/go-ethereum/common"
	"github.com/getline-network/getline/metabackend/util"
	"github.com/getline-network/getline/pb"
	"github.com/golang/glog"
	"github.com/jmoiron/sqlx"
	"github.com/teris-io/shortid"
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
	State struct {
		CurrentState pb.LoanLifetimeState
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

type fieldsLoanMetadata struct {
	// Identification
	ID      int64  `db:"meta_loan_metadata_id"`
	ShortID string `db:"meta_shortid"`
	Network string `db:"meta_network"`

	// Metadata
	DeployedAddress []byte `db:"meta_deployed_address"`
	Borrower        []byte `db:"meta_borrower"`
	Description     string `db:"meta_description"`
}

type fieldsDeployedLoanParameters struct {
	// Identification
	Network string `db:"params_network"`
	Version int64  `db:"params_version"`
	Address []byte `db:"params_address"`

	// Parameters
	BorrowedToken          []byte `db:"params_borrowed_token"`
	CollateralToken        []byte `db:"params_collateral_token"`
	AmountWanted           string `db:"params_amount_wanted"`
	Borrower               []byte `db:"params_borrower"`
	InterestPermil         uint16 `db:"params_interest_permil"`
	FundraisingBlocksCount string `db:"params_fundraising_blocks_count"`
	PaybackBlocksCount     string `db:"params_payback_blocks_count"`
}

type joinedLoansMetadataParameters struct {
	fieldsLoanMetadata
	fieldsDeployedLoanParameters
}

func (m *Model) selectJoinedLoansMetadataParameters(ctx context.Context, keys []string, args []interface{}) (data []joinedLoansMetadataParameters, err error) {
	query := `
		SELECT
			meta.loan_metadata_id AS meta_loan_metadata_id,
			meta.shortid AS meta_shortid,
			meta.network AS meta_network,
			meta.deployed_address AS meta_deployed_address,
			meta.borrower AS meta_borrower,
			meta.description AS meta_description,

			params.borrowed_token AS params_borrowed_token,
			params.collateral_token AS params_collateral_token,
			params.amount_wanted AS params_amount_wanted,
			params.interest_permil AS params_interest_permil,
			params.fundraising_blocks_count AS params_fundraising_blocks_count,
			params.payback_blocks_count AS params_payback_blocks_count
		FROM loan_metadata AS meta
		JOIN deployed_loan_parameters AS params
			ON meta.deployed_address = params.address
			AND meta.network = params.network
	` + buildWhere(keys)
	err = m.dbConn.SelectContext(ctx, &data, query, args...)
	return data, err
}

func (t *fieldsDeployedLoanParameters) Fill(l *Loan) error {
	var amountWanted, fundraisingBlocksCount, paybackBlocksCount *big.Int
	var ok bool

	if amountWanted, ok = new(big.Int).SetString(t.AmountWanted, 10); !ok {
		return fmt.Errorf("invalid amount_wanted value")
	}
	if fundraisingBlocksCount, ok = new(big.Int).SetString(t.FundraisingBlocksCount, 10); !ok {
		return fmt.Errorf("invalid fundraising_blocks_count value")
	}
	if paybackBlocksCount, ok = new(big.Int).SetString(t.PaybackBlocksCount, 10); !ok {
		return fmt.Errorf("invalid payback_blocks_count value")
	}

	l.Parameters.BorrowedToken = ethcommon.BytesToAddress(t.BorrowedToken)
	l.Parameters.CollateralToken = ethcommon.BytesToAddress(t.CollateralToken)
	l.Parameters.Borrower = ethcommon.BytesToAddress(t.Borrower)
	l.Parameters.InterestPermil = t.InterestPermil
	l.Parameters.AmountWanted = amountWanted
	l.Parameters.FundraisingBlocksCount = fundraisingBlocksCount
	l.Parameters.PaybackBlocksCount = paybackBlocksCount

	return nil
}

func (t *fieldsLoanMetadata) Fill(l *Loan) error {
	if t.Network == "" {
		return fmt.Errorf("Network not set")
	}
	if t.ShortID == "" {
		return fmt.Errorf("ShortID not set")
	}
	if len(t.Borrower) == 0 {
		return fmt.Errorf("Borrower not set")
	}
	if len(t.DeployedAddress) == 0 {
		return fmt.Errorf("DeployedAddress not set")
	}
	l.Metadata.NetworkID = t.Network
	l.Metadata.ShortID = t.ShortID
	l.Metadata.Borrower = ethcommon.BytesToAddress(t.Borrower)
	l.Metadata.Description = t.Description
	l.Metadata.DeployedAddress = ethcommon.BytesToAddress(t.DeployedAddress)
	return nil
}

type LoanQuery struct {
	Network         string
	ShortID         string
	Borrower        *ethcommon.Address
	DeployedAddress *ethcommon.Address
	State           pb.LoanLifetimeState
}

func buildWhere(keys []string) string {
	if len(keys) == 0 {
		return ""
	}

	where := []string{}
	for i, key := range keys {
		where = append(where, fmt.Sprintf("%s = $%d", key, i+1))
	}

	return "WHERE " + strings.Join(where, " AND ")
}

func (q LoanQuery) Run(ctx context.Context, m *Model) ([]Loan, error) {
	keys := []string{}
	args := []interface{}{}

	if q.Network != "" {
		keys = append(keys, "meta.network")
		args = append(args, q.Network)
	}
	if q.DeployedAddress != nil {
		keys = append(keys, "meta.deployed_address")
		args = append(args, q.DeployedAddress.Bytes())
	}
	if q.Borrower != nil {
		keys = append(keys, "meta.borrower")
		args = append(args, q.Borrower.Bytes())
	}
	if q.ShortID != "" {
		keys = append(keys, "meta.shortid")
		args = append(args, q.ShortID)
	}

	data, err := m.selectJoinedLoansMetadataParameters(ctx, keys, args)
	if err != nil {
		return []Loan{}, err
	}
	res := []Loan{}
	for _, d := range data {
		l := Loan{model: m}
		if err := d.fieldsLoanMetadata.Fill(&l); err != nil {
			glog.Warningf("when filling metadata from db: %v", err)
			continue
		}

		if err := d.fieldsDeployedLoanParameters.Fill(&l); err != nil {
			glog.Warningf("when filling parameters from db: %v", err)
			continue
		}
		res = append(res, l)
	}

	if q.State != pb.LoanLifetimeState_INVALID {
		// TODO(q3k): Cache this. For now let's call the blockchain for every
		// loan and see if it's in the desired state.
		wg := sync.WaitGroup{}
		wg.Add(len(res))
		loansFiltered := make(chan *Loan, len(res))
		for _, loan := range res {
			loan = loan
			go func(l Loan) {
				defer wg.Done()
				if err := l.LoadStateFromBlockchain(ctx); err != nil {
					glog.Errorf("When loading state from blockchain: %v", err)
					return
				}
				if l.State.CurrentState != q.State {
					return
				}
				loansFiltered <- &l
			}(loan)
		}
		wg.Wait()
		close(loansFiltered)

		res = make([]Loan, 0, len(res))
		for l := range loansFiltered {
			res = append(res, *l)
		}
	}

	return res, nil
}

func (l *Loan) generateShortId(ctx context.Context, tx *sqlx.Tx) error {
	// Generate unique shortID, ensure it's not duplicate in the database.
	// This is somewhat hacky, even with the guarantees of the shortid library
	// that we use.
	var err error
	tries := 0
	shortID := ""

	for {
		tries += 1
		if tries > 10 {
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

	l.Metadata.ShortID = shortID
	return nil
}

func (l *Loan) UpsertMetadata(ctx context.Context, tx *sqlx.Tx) error {
	var err error
	if l.Metadata.ShortID == "" {
		if err = l.generateShortId(ctx, tx); err != nil {
			return err
		}
	}

	// Currently we only modify the description for updated loans.
	query := `
		INSERT INTO loan_metadata (
				shortid, borrower, description, network, deployed_address
		)
		VALUES (
				:meta_shortid, :meta_borrower, :meta_description, :meta_network, :meta_deployed_address
		)
		ON CONFLICT (shortid) DO
		UPDATE SET
			description = :meta_description
	`
	_, err = l.model.dbConn.NamedExecContext(ctx, query, fieldsLoanMetadata{
		ShortID:         l.Metadata.ShortID,
		Network:         l.Metadata.NetworkID,
		DeployedAddress: l.Metadata.DeployedAddress.Bytes(),
		Borrower:        l.Metadata.Borrower.Bytes(),
		Description:     l.Metadata.Description,
	})
	return err
}

func (l *Loan) InsertParameters(ctx context.Context, tx *sqlx.Tx) error {
	query := `
		INSERT INTO deployed_loan_parameters (
				network, version, address,
				borrowed_token, collateral_token, amount_wanted, borrower,
				interest_permil, fundraising_blocks_count, payback_blocks_count
		)
		VALUES (
				:params_network, :params_version, :params_address,
				:params_borrowed_token, :params_collateral_token, :params_amount_wanted, :params_borrower,
				:params_interest_permil, :params_fundraising_blocks_count, :params_payback_blocks_count
		)
	`
	_, err := l.model.dbConn.NamedExecContext(ctx, query, fieldsDeployedLoanParameters{

		Network:                l.Metadata.NetworkID,
		Version:                0,
		Address:                l.Metadata.DeployedAddress.Bytes(),
		BorrowedToken:          l.Parameters.BorrowedToken.Bytes(),
		CollateralToken:        l.Parameters.CollateralToken.Bytes(),
		AmountWanted:           l.Parameters.AmountWanted.String(),
		Borrower:               l.Parameters.Borrower.Bytes(),
		InterestPermil:         l.Parameters.InterestPermil,
		FundraisingBlocksCount: l.Parameters.FundraisingBlocksCount.String(),
		PaybackBlocksCount:     l.Parameters.PaybackBlocksCount.String(),
	})
	return err
}

func (l *Loan) LoadParametersFromBlockchain(ctx context.Context) error {
	loanContract, err := l.model.blockchain.get(ctx, l.Metadata.NetworkID, "Loan", l.Metadata.DeployedAddress)
	if err != nil {
		return fmt.Errorf("getting Loan contract failed: %v", err)
	}

	getters := []struct {
		target interface{}
		name   string
	}{
		{&l.Parameters.BorrowedToken, "borrowedToken"},
		{&l.Parameters.CollateralToken, "collateralToken"},
		{&l.Parameters.AmountWanted, "amountWanted"},
		{&l.Parameters.Borrower, "borrower"},
		{&l.Parameters.InterestPermil, "interestPermil"},
		{&l.Parameters.FundraisingBlocksCount, "fundraisingBlocksCount"},
		{&l.Parameters.PaybackBlocksCount, "paybackBlocksCount"},
	}
	for _, getter := range getters {
		err = loanContract.Call(nil, getter.target, getter.name)
		if err != nil {
			return fmt.Errorf("calling getter %q failed: %v", getter.name, err)
		}
	}

	return nil
}

func (l *Loan) LoadStateFromBlockchain(ctx context.Context) error {
	loanContract, err := l.model.blockchain.get(ctx, l.Metadata.NetworkID, "Loan", l.Metadata.DeployedAddress)
	if err != nil {
		return fmt.Errorf("getting Loan contract failed: %v", err)
	}

	var state uint8

	// Try to first call the `getCurrentState` method that performs a
	// timedTransitions check. This method is not present on all contracts,
	// so we need to refresh manually then.
	needsRefresh := false
	if err = loanContract.Call(nil, &state, "getCurrentState"); err != nil {
		needsRefresh = true
	}

	if needsRefresh {
		if err = loanContract.Call(nil, &state, "currentState"); err != nil {
			return fmt.Errorf("calling currentState failed: %v", err)
		}
		var fundraising, paidback, defaulted bool
		errs := []error{}
		errs = append(errs, loanContract.Call(nil, &fundraising, "isFundraising"))
		errs = append(errs, loanContract.Call(nil, &paidback, "isPaidback"))
		errs = append(errs, loanContract.Call(nil, &defaulted, "isDefaulted"))
		failed := false
		for _, err := range errs {
			if err != nil {
				glog.Warningf("Manual refresh of loan status failed: %v", err)
				failed = true
				continue
			}
		}
		// The only state transition that occurs automatically is a loan going
		// into the finished state -- either because we paidback or defaulted.
		// All other state transitions occur only when a mutable function is
		// called.
		if !failed {
			if !fundraising && (paidback || defaulted) {
				state = 3
			}
		}
	}

	switch state {
	case 0:
		l.State.CurrentState = pb.LoanLifetimeState_COLLATERAL_COLLECTION
	case 1:
		l.State.CurrentState = pb.LoanLifetimeState_FUNDRAISING
	case 2:
		l.State.CurrentState = pb.LoanLifetimeState_PAYBACK
	case 3:
		l.State.CurrentState = pb.LoanLifetimeState_FINISHED
	default:
		return fmt.Errorf("unexpected currentState: %d", state)
	}

	return nil
}
