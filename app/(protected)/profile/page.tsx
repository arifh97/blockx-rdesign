'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useSetActiveWallet } from '@privy-io/wagmi';
import { useAccount, useDisconnect, useSwitchAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  
  // WAGMI hooks
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectors, switchAccount } = useSwitchAccount();
  const { setActiveWallet } = useSetActiveWallet();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Welcome Card */}
      <Card>
        <CardHeader>
          <CardTitle>Welcome to BlockX! 🎉</CardTitle>
          <CardDescription>You&apos;re successfully logged in and this is a protected route.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Your Account Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="font-mono">{user?.id}</span>
                </div>
                {user?.email?.address && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{user.email.address}</span>
                  </div>
                )}
                {user?.phone?.number && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{user.phone.number}</span>
                  </div>
                )}
                {user?.wallet?.address && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Wallet:</span>
                    <span className="font-mono">{user.wallet.address}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Created At:</span>
                  <span>{new Date(user?.createdAt || '').toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Linked Accounts Card */}
      <Card>
        <CardHeader>
          <CardTitle>Linked Accounts</CardTitle>
          <CardDescription>Your connected authentication methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {user?.linkedAccounts?.map((account, index) => {
              // Type-safe way to get account identifier
              const getAccountIdentifier = (): string => {
                if ('address' in account && typeof account.address === 'string') return account.address;
                if ('email' in account && typeof account.email === 'string') return account.email;
                if ('phoneNumber' in account && typeof account.phoneNumber === 'string') return account.phoneNumber;
                return 'Connected';
              };

              const getVerifiedDate = (): string | null => {
                if ('verifiedAt' in account && account.verifiedAt) {
                  const date =
                    typeof account.verifiedAt === 'string' || typeof account.verifiedAt === 'number'
                      ? new Date(account.verifiedAt)
                      : null;
                  return date ? `Verified ${date.toLocaleDateString()}` : null;
                }
                return null;
              };

              return (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium capitalize">{account.type}</p>
                    <p className="text-sm text-muted-foreground">{getAccountIdentifier()}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{getVerifiedDate()}</div>
                </div>
              );
            })}
            {(!user?.linkedAccounts || user.linkedAccounts.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No linked accounts found</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Wallets Card */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Wallets</CardTitle>
          <CardDescription>All wallets linked to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {user?.linkedAccounts?.filter((account) => account.type === 'wallet').length ? (
              user.linkedAccounts
                .filter((account) => account.type === 'wallet')
                .map((wallet, index) => {
                  const walletAddress = 'address' in wallet && typeof wallet.address === 'string' ? wallet.address : '';
                  const walletType =
                    'walletClient' in wallet && typeof wallet.walletClient === 'string'
                      ? wallet.walletClient
                      : 'wallet';
                  const chainId = 'chainId' in wallet && typeof wallet.chainId === 'string' ? wallet.chainId : '';

                  return (
                    <div
                      key={walletAddress || index}
                      className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium capitalize">{walletType}</p>
                          {walletType === 'privy' && (
                            <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded">Embedded</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-mono break-all">{walletAddress}</p>
                        {chainId && (
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>Chain ID: {String(chainId)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (walletAddress) {
                              navigator.clipboard.writeText(walletAddress);
                            }
                          }}
                        >
                          Copy Address
                        </Button>
                      </div>
                    </div>
                  );
                })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No wallets linked to your account</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* WAGMI Connection State Card */}
      <Card>
        <CardHeader>
          <CardTitle>WAGMI Connection</CardTitle>
          <CardDescription>Web3 wallet connection status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Connection status:</span>
              {isConnecting && <span className="text-yellow-500">🟡 connecting...</span>}
              {isConnected && <span className="text-green-500">🟢 connected</span>}
              {isDisconnected && <span className="text-red-500">🔴 disconnected</span>}
            </div>
            
            {isConnected && address && (
              <div className="space-y-4">
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">useAccount</h3>
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <span className="text-sm text-muted-foreground">Address:</span>
                    <span className="font-mono text-sm">{address}</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">useDisconnect</h3>
                  <Button 
                    onClick={() => disconnect()} 
                    variant="destructive"
                  >
                    Disconnect from WAGMI
                  </Button>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">useSwitchAccount</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-3">
                      Switch between available wallet connectors
                    </p>
                    {connectors.map((connector) => (
                      <div key={connector.uid} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{connector.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {connector.type}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => switchAccount({ connector })}
                        >
                          Switch to {connector.name}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">useSetActiveWallet</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-3">
                      Set which wallet should be active for transactions
                    </p>
                    {wallets.map((wallet) => {
                      const isActive = wallet.address === address;
                      
                      return (
                        <div key={wallet.address} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{wallet.walletClientType}</p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isActive && (
                              <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">Active</span>
                            )}
                            {!isActive && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setActiveWallet(wallet)}
                              >
                                Set Active
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
