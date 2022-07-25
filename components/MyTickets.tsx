import { useEffect, useState } from 'react'
import Modal from 'react-modal'
import styles from '../styles/Home.module.css'
import { Ticket } from './Ticket'
import * as t from '@onflow/types'

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

export const MyTickets = ({ fcl, address }: { fcl: any; address: string }) => {
  const [modalIsOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tickets, setTickets] = useState<any[]>([])

  const fetchTickets = async () => {
    setLoading(true)
    const response = await fcl
      .send([
        fcl.script(`
      import MintixNFT from 0x6bf18e3dfebbc512

      pub fun main(account: Address): [UInt64] {
        let nftCollection = getAccount(account).getCapability(/public/MintixNFTCollection)
                              .borrow<&MintixNFT.Collection{MintixNFT.CollectionPublic}>()
                              ?? panic("This NFT Collection does not exist.")

        return nftCollection.getIDs()
      }
    `),
        fcl.args([fcl.arg(address, t.Address)]),
      ])
      .then(fcl.decode)
      .catch((e: any) => {
        return []
      })

    response.sort(function (a: number, b: number) {
      return b - a
    })

    const res = await Promise.all(
      response.map(async (id: string) => {
        return await fcl
          .send([
            fcl.script(`
          import MintixNFT from 0x6bf18e3dfebbc512

          pub fun main(account: Address, id: UInt64): [String] {
            let nftCollection = getAccount(account).getCapability(/public/MintixNFTCollection)
                                  .borrow<&MintixNFT.Collection{MintixNFT.CollectionPublic}>()
                                  ?? panic("This NFT Collection does not exist.")
          
            let info: [String] = []
            let nftRef = nftCollection.borrowEntireNFT(id: id)
          
            info.append(nftRef.id.toString())
            info.append(nftRef.image)
            info.append(nftRef.name)
            
            return info
          }
      `),
            fcl.args([fcl.arg(address, t.Address)]),
            fcl.args([fcl.arg(id, t.UInt64)]),
          ])
          .then(fcl.decode)
          .catch((e: any) => {
            return []
          })
      })
    )

    setTickets(res)
    setLoading(false)
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  async function openModal() {
    await fetchTickets()
    setIsOpen(true)
  }

  function closeModal() {
    setIsOpen(false)
  }

  return (
    <div>
      <button onClick={openModal} className={styles.code}>
        My tickets
      </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
      >
        <h2 style={{ textAlign: 'center', fontSize: '30px' }}>My tickets</h2>
        <div className={styles.ticketsList}>
          {tickets.map((ticket) => (
            <div key={ticket[0]}>
              <Ticket
                id={ticket[0]}
                title={ticket[2]}
                img={ticket[1]}
                fcl={fcl}
              />
            </div>
          ))}
        </div>
        {loading && (
          <span
            style={{ textAlign: 'center', display: 'block', fontSize: '23px' }}
          >
            Loading...
          </span>
        )}
        {!tickets.length && !loading && (
          <span
            style={{ textAlign: 'center', display: 'block', fontSize: '23px' }}
          >
            You don't have any tickets
          </span>
        )}
      </Modal>
    </div>
  )
}
