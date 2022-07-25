import { useState } from 'react'
import Modal from 'react-modal'
import * as fcl from '@onflow/fcl'
import * as t from '@onflow/types'
import styles from '../styles/Home.module.css'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
}

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement('#__next')

export const CreateEvent = ({ fcl }: { fcl: any }) => {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState(false)
  const [modalIsOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [picture, setPicture] = useState('')
  const [amount, setAmount] = useState('')

  const onSubmit = async (ev: any) => {
    ev.preventDefault()

    setLoading(true)

    const transactionId = await fcl
      .send([
        fcl.transaction(`
      import NonFungibleToken from 0x631e88ae7f1d7c20
      import MintixNFT from 0x6bf18e3dfebbc512
      
      transaction(image: String, name: String, amount: UInt64) {
        prepare(acct: AuthAccount) {
          if acct.borrow<&MintixNFT.Collection>(from: /storage/MintixNFTCollection) == nil {
            acct.save(<- MintixNFT.createEmptyCollection(), to: /storage/MintixNFTCollection)
            acct.link<&MintixNFT.Collection{NonFungibleToken.CollectionPublic, MintixNFT.CollectionPublic}>(/public/MintixNFTCollection, target: /storage/MintixNFTCollection)
          }
      
          var nftCollection = acct.borrow<&MintixNFT.Collection>(from: /storage/MintixNFTCollection)!
      
          let tokens <- MintixNFT.mintNFT(image: image, eventName: name, amount: amount)
      
          MintixNFT.massiveDeposite(tokens: <- tokens, nftCollection: nftCollection)
        }
      
        execute {
          log("Minted an NFT")
        }
      }`),
        fcl.args([
          fcl.arg(picture, t.String),
          fcl.arg(name, t.String),
          fcl.arg(amount, t.UInt64),
        ]),
        fcl.payer(fcl.authz),
        fcl.proposer(fcl.authz),
        fcl.authorizations([fcl.authz]),
        fcl.limit(9999),
      ])
      .then(fcl.decode)
      .catch((err: any) => {
        setLoading(false)
        console.log(err)
        setError(true)
      })

    setLoading(false)

    error || setSuccess(transactionId)
  }

  return (
    <div>
      <button onClick={() => setIsOpen(true)} className={styles.code}>
        Create new event
      </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setIsOpen(false)}
        style={customStyles}
      >
        {loading && <div className={styles.loader}></div>}
        {success && (
          <div className={styles.success}>
            <p>
              You've successfully minted{' '}
              <span>
                {amount} tickets to {name}
              </span>
            </p>
            <a
              href={`https://testnet.flowscan.org/transaction/${success}`}
              target={'_blank'}
            >
              Check transaction on FlowScan
            </a>
          </div>
        )}
        {error && (
          <div className={styles.error}>
            Something went wrong, please
            <span>try again.</span>
          </div>
        )}
        {!loading && !success && (
          <form className="creatingModal" onSubmit={onSubmit}>
            <input
              type={'text'}
              placeholder={'Event name'}
              required
              onChange={(ev) => setName(ev.target.value)}
            />
            <input
              type={'url'}
              placeholder={'Event picture'}
              required
              onChange={(ev) => setPicture(ev.target.value)}
            />
            <input
              type={'number'}
              min="1"
              placeholder={'Amount of tickets'}
              required
              onChange={(ev) => setAmount(ev.target.value)}
            />
            <button>Create event</button>
          </form>
        )}
      </Modal>
    </div>
  )
}
