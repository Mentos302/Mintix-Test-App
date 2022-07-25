import Image from 'next/image'
import { useState } from 'react'
import Modal from 'react-modal'
import nft from '../../public/nft.jpg'
import styles from '../styles/Home.module.css'
import * as t from '@onflow/types'

import transferNFT from '../cadence/transactions/transferNFT'
import destroyNFT from '../cadence/transactions/destroyNFT'

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

type propTypes = { id: number; title: string; img: string; fcl: any }

export const Ticket = ({ id, title, img, fcl }: propTypes) => {
  const [getReceiver, setGetReceiver] = useState(false)
  const [recepientWallet, setRecepientWallet] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState(false)

  const transferHandler = async (ev: any) => {
    ev.preventDefault()

    setLoading(true)

    const transactionId = await fcl
      .send([
        fcl.transaction(transferNFT),
        fcl.args([fcl.arg(recepientWallet, t.Address), fcl.arg(id, t.UInt64)]),
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

  const destroyToken = async () => {
    setGetReceiver(true)
    setLoading(true)

    const transactionId = await fcl
      .send([
        fcl.transaction(destroyNFT),
        fcl.args([fcl.arg(id, t.UInt64)]),
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
    <>
      {!success && (
        <div className={styles.ticket}>
          <img src={img} alt="" />
          <div className={styles.inner}>
            <div className={styles.info}>
              <b>{title}</b>
              <div className={styles.actions}>
                <button onClick={() => setGetReceiver(true)}>Transfer</button>
                <button onClick={destroyToken}>Destroy</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Modal
        isOpen={getReceiver}
        onRequestClose={() => setGetReceiver(false)}
        style={customStyles}
      >
        <h2 style={{ textAlign: 'center', fontSize: '30px' }}>
          Ticket transferring
        </h2>
        {!loading && !success && !error && (
          <form className={styles.transferForm} onSubmit={transferHandler}>
            <input
              type="text"
              placeholder="Recepient wallet"
              required
              onChange={(ev) => setRecepientWallet(ev.target.value)}
            />
            <button>Transfer ticket</button>
          </form>
        )}
        {success && (
          <div className={styles.success}>
            <p>You've successfully moved your ticket</p>
            <a
              href={`https://testnet.flowscan.org/transaction/${success}`}
              target={'_blank'}
              rel="noreferrer"
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
        {loading && <div className={styles.loader}></div>}
      </Modal>
    </>
  )
}
