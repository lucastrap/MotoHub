import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home Page', () => {
  it('renders a heading', () => {
    render(<Home />)
    const heading = screen.getByRole('heading', { name: /Welcome to MotoTracker Pro/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders login and register links', () => {
    render(<Home />)
    const loginLink = screen.getByRole('link', { name: /Login/i })
    const registerLink = screen.getByRole('link', { name: /Register/i })
    
    expect(loginLink).toBeInTheDocument()
    expect(registerLink).toBeInTheDocument()
  })
})
