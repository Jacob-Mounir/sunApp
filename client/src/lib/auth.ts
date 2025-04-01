import { apiRequest } from './queryClient';
import config from '../config';

export interface User {
	id: string;
	username: string;
	email: string;
	fullName?: string;
	avatarUrl?: string;
	googleId?: string;
	isVerified: boolean;
	createdAt?: string;
	lastLogin?: string;
	savedVenues?: string[];
}

export interface LoginCredentials {
	username: string;
	password: string;
}

export interface RegisterData {
	username: string;
	email: string;
	password: string;
	fullName?: string;
}

/**
 * Register a new user
 */
export async function registerUser(data: RegisterData): Promise<User> {
	const response = await fetch(`${config.apiBaseUrl}/auth/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || 'Registration failed');
	}

	return response.json();
}

/**
 * Login a user
 */
export async function loginUser(credentials: LoginCredentials): Promise<User> {
	const response = await fetch(`${config.apiBaseUrl}/auth/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify(credentials),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || 'Login failed');
	}

	return response.json();
}

/**
 * Redirect to Google login page
 */
export function loginWithGoogle(): void {
	window.location.href = `${config.apiBaseUrl}/auth/google`;
}

/**
 * Logout the current user
 */
export async function logoutUser(): Promise<void> {
	const response = await fetch(`${config.apiBaseUrl}/auth/logout`, {
		method: 'POST',
		credentials: 'include',
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(errorData.error || 'Logout failed');
	}
}

/**
 * Get the current logged in user
 */
export async function getCurrentUser(): Promise<User | null> {
	try {
		const response = await fetch(`${config.apiBaseUrl}/auth/me`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			if (response.status === 401) {
				return null; // Not authenticated
			}
			const errorData = await response.json();
			throw new Error(errorData.error || 'Failed to get user');
		}

		return response.json();
	} catch (error) {
		console.error('Error getting current user:', error);
		return null;
	}
}

/**
 * Check if the URL contains Google auth parameters and handle accordingly
 */
export function handleGoogleAuthRedirect(): boolean {
	const url = new URL(window.location.href);
	const isGoogleAuth = url.searchParams.get('auth') === 'google';

	if (isGoogleAuth) {
		// Remove the auth parameter to prevent confusion on refresh
		url.searchParams.delete('auth');
		window.history.replaceState({}, document.title, url.toString());
		return true;
	}

	return false;
}