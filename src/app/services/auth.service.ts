import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAbSKouIqofLaIaF8jM-o-X_T52gVQjsSU",
  authDomain: "etscrosswords.firebaseapp.com",
  projectId: "etscrosswords",
  storageBucket: "etscrosswords.firebasestorage.app",
  messagingSenderId: "83052710270",
  appId: "1:83052710270:web:1dd3a955c615593832cb2f",
  measurementId: "G-4S5QTX9BK1"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export interface User {
  name: string;
  email: string;
  picture: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user = signal<User | null>(null);
  public isAdmin = signal<boolean>(false);
  public isAuthReady = signal<boolean>(false);
  public isLoggingIn = signal<boolean>(false);
  public loginError = signal<string | null>(null);
  private router = inject(Router);

  constructor() {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const idTokenResult = await firebaseUser.getIdTokenResult();
        this.isAdmin.set(!!idTokenResult.claims['admin']);
        
        this.user.set({
          name: firebaseUser.displayName || 'ET Player',
          email: firebaseUser.email || '',
          picture: firebaseUser.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=ET'
        });
      } else {
        this.user.set(null);
        this.isAdmin.set(false);
      }
      this.isAuthReady.set(true);
    });
  }

  async refreshAdminClaim() {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const idTokenResult = await currentUser.getIdTokenResult(true);
      this.isAdmin.set(!!idTokenResult.claims['admin']);
    }
  }

  async loginWithGoogle() {
    if (this.isLoggingIn()) return;
    
    this.isLoggingIn.set(true);
    this.loginError.set(null);
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
      this.router.navigate(['/home']);
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const firebaseError = error as any;
      console.error("Error signing in with Google", firebaseError);
      
      let message = "An error occurred during sign in.";
      
      if (firebaseError.code === 'auth/popup-blocked') {
        message = "The login popup was blocked by your browser. Please allow popups for this site.";
      } else if (firebaseError.code === 'auth/cancelled-popup-request') {
        message = "Login was cancelled. Please try again.";
      } else if (firebaseError.code === 'auth/popup-closed-by-user') {
        message = "Login window was closed before completion.";
      } else if (firebaseError.message?.includes('INTERNAL ASSERTION FAILED')) {
        message = "A temporary authentication error occurred. Please refresh the page and try again.";
      } else if (firebaseError.message) {
        message = firebaseError.message;
      }
      
      this.loginError.set(message);
    } finally {
      this.isLoggingIn.set(false);
    }
  }

  async logout() {
    try {
      await signOut(auth);
      this.router.navigate(['/welcome']);
    } catch (error) {
      console.error("Error signing out", error);
    }
  }

  isAuthenticated(): boolean {
    return this.user() !== null;
  }
}
