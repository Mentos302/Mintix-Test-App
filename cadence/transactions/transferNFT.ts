export default `
import MintixNFT from 0x6bf18e3dfebbc512

transaction (recipient: Address, tokenID: UInt64) {

    let transferToken: @MintixNFT.NFT

    prepare(acct: AuthAccount) {

        let collectionRef = acct.borrow<&MintixNFT.Collection>(from: /storage/MintixNFTCollection)
            ?? panic("Could not borrow a reference to the owner's collection")

        self.transferToken <- collectionRef.withdraw(withdrawID: tokenID) as! @MintixNFT.NFT
    }

    execute {
        let recipient = getAccount(recipient)

        let receiverRef = recipient.getCapability<&{MintixNFT.CollectionPublic}>(/public/MintixNFTCollection)
            .borrow()
            ?? panic("Could not borrow receiver reference")

        receiverRef.deposit(token: <-self.transferToken)
    }
}`
