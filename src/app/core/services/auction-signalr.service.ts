import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuctionSignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private bidPlacedSource = new BehaviorSubject<any>(null);
  private auctionUpdateSource = new BehaviorSubject<any>(null);
  private auctionCreatedSource = new BehaviorSubject<any>(null);
  private auctionDeletedSource = new BehaviorSubject<any>(null);
  private bidSuccessSource = new BehaviorSubject<any>(null);
  private errorSource = new BehaviorSubject<string | null>(null);
  private connectionStartedSource = new BehaviorSubject<boolean>(false);

  bidPlaced$ = this.bidPlacedSource.asObservable();
  auctionUpdate$ = this.auctionUpdateSource.asObservable();
  auctionCreated$ = this.auctionCreatedSource.asObservable();
  auctionDeleted$ = this.auctionDeletedSource.asObservable();
  bidSuccess$ = this.bidSuccessSource.asObservable();
  error$ = this.errorSource.asObservable();
  connectionStarted$ = this.connectionStartedSource.asObservable();

  constructor(private authService: AuthService) {}

  startConnection() {
    const token = this.authService.getAccessToken();
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5250/auctionHub', {
        accessTokenFactory: () => token || ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().then(() => {
      console.log('SignalR Connected!');
      this.connectionStartedSource.next(true);
    }).catch(err => {
      console.error('SignalR Connection Error:', err);
      this.connectionStartedSource.next(false);
    });

    

    this.hubConnection.on('BidPlaced', (data) => {
      console.log('[SignalR] BidPlaced event received:', data);
      this.bidPlacedSource.next(data);
    });

    this.hubConnection.on('AuctionUpdate', (data) => {
      console.log('[SignalR] AuctionUpdate event received:', data);
      this.auctionUpdateSource.next(data);
    });

    this.hubConnection.on('AuctionCreated', (data) => {
      console.log('[SignalR] AuctionCreated event received:', data);
      this.auctionCreatedSource.next(data);
    });

    this.hubConnection.on('AuctionDeleted', (data) => {
      console.log('[SignalR] AuctionDeleted event received:', data);
      this.auctionDeletedSource.next(data);
    });

    this.hubConnection.on('BidSuccess', (data) => {
      console.log('[SignalR] BidSuccess event received:', data);
      this.bidSuccessSource.next(data);
    });
    this.hubConnection.on('Error', (msg) => {
      console.error('[SignalR] Error event received:', msg);
      this.errorSource.next(msg);
    });

    // Add more event handlers as needed
  }

  public get isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }

  joinAuction(auctionId: number) {
    if (!this.hubConnection) {
      console.error('[SignalR] joinAuction called before connection established');
      return;
    }
    console.log('[SignalR] Calling joinAuction for auction:', auctionId);
    this.hubConnection.invoke('JoinAuction', auctionId)
      .then(() => console.log('[SignalR] joinAuction invoked for auction:', auctionId))
      .catch(err => console.error('[SignalR] joinAuction error:', err));
  }

  leaveAuction(auctionId: number) {
    this.hubConnection?.invoke('LeaveAuction', auctionId);
  }

  placeBid(bid: any) {
    this.hubConnection?.invoke('PlaceBid', bid);
  }

  // ... other methods as needed
}