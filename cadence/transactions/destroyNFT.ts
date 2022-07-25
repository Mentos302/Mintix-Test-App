export default `
import MintixNFT from 0x6bf18e3dfebbc512

    transaction (tokenID: UInt64) {
        prepare(acct: AuthAccount) {
            // Borrow a reference from the stored collection
            let collectionRef = acct.borrow<&MintixNFT.Collection>(from: /storage/MintixNFTCollection)
                ?? panic("Could not borrow a reference to the owner's collection")

            let token <- collectionRef.withdraw(withdrawID: tokenID) as! @MintixNFT.NFT

            destroy token
        }
    }
`
