import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { CreateEvent } from '../components/CreateEvent'
import { MyTickets } from '../components/MyTickets'
import { Ticket } from '../components/Ticket'
import * as fcl from '@onflow/fcl'
import * as t from '@onflow/types'
import { useEffect, useState } from 'react'

fcl
  .config()
  .put('accessNode.api', 'https://rest-testnet.onflow.org')
  .put('discovery.wallet', 'https://fcl-discovery.onflow.org/testnet/authn')
  .put('app.detail.title', 'Mintix Test App')
  .put(
    'app.detail.icon',
    'https://img.freepik.com/premium-photo/happy-people-dance-in-nightclub-party-concert_31965-114.jpg?w=2000 '
  )

const Home: NextPage = () => {
  const [user, setUser] = useState<any>()

  useEffect(() => {
    fcl.currentUser().subscribe(setUser)
  }, [])

  const logIn = () => {
    fcl.authenticate()
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Mintix Contract TestApp</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title} style={{ marginBottom: '20px' }}>
          Mintix TestApp
        </h1>
        <h1 className={styles.title}>
          {user?.addr ? (
            <span>
              Hi, your wallet:{' '}
              <a
                href={`https://testnet.flowscan.org/account/${user.addr}`}
                target={'_blank'}
                rel="noreferrer"
              >
                {user.addr}
              </a>
            </span>
          ) : (
            <span>
              Hi, please login via: <a onClick={() => logIn()}>Blocto</a>
            </span>
          )}
        </h1>

        <div className={styles.description}>
          {user?.addr && (
            <>
              <MyTickets fcl={fcl} address={user.addr} />
              <CreateEvent fcl={fcl} />
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default Home
