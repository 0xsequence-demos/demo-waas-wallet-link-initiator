import { useState, useEffect } from 'react'
import './App.css'
import sequence from './SequenceEmbeddedWallet'
import { useSessionHash } from './useSessionHash'
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import AppleSignin from 'react-apple-signin-auth';
import sequenceLogo from './assets/sequence-icon.svg'
import {Button, Card} from '@0xsequence/design-system'
function CenteredLogo() {
  const containerStyle = {
    display: 'grid',
    placeItems: 'center',
    width: '97.5vw',  // Full viewport width
  };

  return (
    <div style={containerStyle}>
      <img src={sequenceLogo} width={150} alt="Sequence Logo" />
    </div>
  );
}

function WalletLink({ wallet }: any) {
  const generateEOALink = async () => {
    try {

      const response = await fetch('https://demo-waas-wallet-link-server.tpin.workers.dev/generateNonce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ walletAddress: wallet })
      })
      
      const data = await response.json()

      // setVerificationLink(data.verificationUrl)
      // setVerificationLink('http://localhost:3006/')
      // setExternalNonce(data.nonce)

      const authProof = await sequence.sessionAuthProof({ 
        nonce: data.nonce, 
        network: '1'
      })

      window.open(`${'https://0xsequence-demos.github.io/demo-waas-wallet-link/'}?nonce=${data.nonce}&signature=${authProof.data.signature}&sessionId=${authProof.data.sessionId}&chainId=${1}`)
      
      // setAuthProofSessionId(authProof.data.sessionId)
      // setAuthProofSignature(authProof.data.signature)

      // setInProgress(false)
    } catch (e) {
      console.error(e)
      // setInProgress(false)
    }
  }
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100vw',  // Full viewport width
    }}>
        <h5>Link an EOA Wallet in a New Browser Window</h5>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px' // Space of 10px between items
      }}>
      <Card>
        <span>{wallet.slice(0, 10) + "..." + wallet.slice(-5)}</span>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <Button label="Open Auth URL 🔗" onClick={() => generateEOALink()} />
      </Card>

      </div>

    </div>
  );
}

function LoginScreen () {
  const { sessionHash } = useSessionHash()

  const [wallet, setWallet] = useState<any>(null)

  const handleGoogleLogin = async (tokenResponse: CredentialResponse) => {
    const res = await sequence.signIn({
      idToken: tokenResponse.credential! // inputted id credential from google
    }, "template")
    setWallet(res.wallet)
  }

  useEffect(() => {
    setTimeout(async () => {
      if(await sequence.isSignedIn()){
        setWallet(await sequence.getAddress())
      }
    }, 0)
  }, [])

  useEffect(() => {

  }, [wallet])

  const signOut = async () => {
    try {
      const sessions = await sequence.listSessions()

      for(let i = 0; i < sessions.length; i++){
        await sequence.dropSession({ sessionId: sessions[i].id })
      }
    }catch(err){
      console.log(err)
    }
  }

  return (
    <>
      {
          <CenteredLogo/>
      }
      <br/>
      <br/>
      {
        !wallet 
      ? 
        <>
          <span className='sign-in-via'>SIGN IN VIA</span>
          <br/>
          <br/>
          <br/>
          <div className="login-container">
          <div className='dashed-box-google'>
              <p className='content'>
                <div className='gmail-login' style={{overflow: 'hidden', opacity: '0',width: '90px', position: 'absolute', zIndex: 1, height: '100px'}}>
                  <GoogleLogin 
                    nonce={sessionHash}
                    key={sessionHash}
                    onSuccess={handleGoogleLogin} shape="circle" width={230} />
                  </div>
                  <span className='gmail-login'>Gmail</span>
              </p>
          </div>
          </div>
        </>
      : 
        <>
        <div style={{position: 'fixed', top: '30px', right:'30px'}}>
        <h5 style={{ cursor: 'pointer', margin: 0 }} onClick={() => signOut()}>Sign Out</h5>
        </div>
        <WalletLink wallet={wallet} />
        </>
      }
    </>
  )
}

function App() {
  return (
    <LoginScreen/>
  )
}

export default App