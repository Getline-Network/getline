package util

import (
	"encoding/hex"
	"fmt"
	"strings"

	"github.com/ethereum/go-ethereum/common"
	"github.com/getline-network/getline/pb"
)

// ProtoAddress returns a proto address from a given 0x-prefixed string
// representation. It does not perform any other sanity checks and is meant to
// only be used in rendering.
func ProtoAddress(ascii string) *pb.Address {
	if ascii == "" {
		return &pb.Address{
			Raw:   []byte(""),
			Ascii: "",
		}
	}
	ascii = strings.TrimPrefix(ascii, "0x")
	raw, err := hex.DecodeString(ascii)
	if err != nil {
		return nil
	}
	return &pb.Address{
		Raw:   raw,
		Ascii: "0x" + ascii,
	}
}

func ProtoAddressDecode(a *pb.Address) (common.Address, error) {
	ascii := a.GetAscii()
	raw := a.GetRaw()
	if ascii != "" && len(raw) > 0 {
		// Both forms given, verify they match.
		addrAscii := common.HexToAddress(ascii)
		addrBytes := common.BytesToAddress(raw)
		if addrAscii.Hex() != addrBytes.Hex() {
			return common.Address{}, fmt.Errorf("address ASCII and Raw forms do not match")
		}
		return addrAscii, nil
	}

	if ascii != "" {
		return common.HexToAddress(ascii), nil
	}
	if len(raw) != 0 {
		return common.BytesToAddress(raw), nil
	}
	return common.Address{}, fmt.Errorf("neither ASCII nor Raw form of address given")
}
