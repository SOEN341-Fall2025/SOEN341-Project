import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AppProvider } from '../__mocks__/AppContext';
import Login from './Login';
import { BrowserRouter } from 'react-router-dom';

// Mock fetch globally
global.fetch = jest.fn();

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Login Component', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    global.fetch.mockReset();
    // Mock successful response
    global.fetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Registration successful' })
      })
    );
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <AppProvider>
          <Login />
        </AppProvider>
      </BrowserRouter>
    );
  };

  test('renders login form by default', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  test('switches to registration form when clicking register link', () => {
    renderLogin();
    fireEvent.click(screen.getByText('Register'));
    expect(screen.getByRole('heading', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument();
  });

  test('handles registration form submission with matching passwords', async () => {
    renderLogin();

    // Switch to registration form
    fireEvent.click(screen.getByText('Register'));

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Create password'), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), {
      target: { value: 'password123' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    // Verify fetch was called with correct data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );

      // Verify the request body contains all required fields
      const requestBody = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(requestBody).toMatchObject({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  test('shows error when passwords do not match during registration', async () => {
    renderLogin();

    // Switch to registration form
    fireEvent.click(screen.getByText('Register'));

    // Fill in the form with mismatched passwords
    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Create password'), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), {
      target: { value: 'differentpassword' }
    });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

    // Verify error message
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  test('switches back to login form when clicking login link', () => {
    renderLogin();

    // Switch to registration form
    fireEvent.click(screen.getByText('Register'));
    // Switch back to login form
    fireEvent.click(screen.getByText('Login'));
    
    // Verify we're back on the login form
    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });
}); 