import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PropertyCard } from '../properties/PropertyCard'
import { mockProperty, mockRentalProperty } from '@/test/mockData/properties'

// Mock the PropertyHealthScore component
vi.mock('../properties/PropertyHealthScore', () => ({
  PropertyHealthScore: ({ score, size }: { score: number; size: string }) => (
    <div data-testid="health-score">{score}%</div>
  ),
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Heart: () => <span data-testid="icon-heart">Heart</span>,
  Share2: () => <span data-testid="icon-share">Share</span>,
  MapPin: () => <span data-testid="icon-mappin">MapPin</span>,
  BedDouble: () => <span data-testid="icon-bed">Bed</span>,
  Bath: () => <span data-testid="icon-bath">Bath</span>,
  Ruler: () => <span data-testid="icon-ruler">Ruler</span>,
  MoreVertical: () => <span data-testid="icon-more">More</span>,
  Edit: () => <span data-testid="icon-edit">Edit</span>,
  Eye: () => <span data-testid="icon-eye">Eye</span>,
}))

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>{children}</button>
  ),
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>,
  CardContent: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardFooter: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardHeader: ({ children, className }: any) => <div className={className}>{children}</div>,
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, variant }: any) => (
    <span className={className} data-testid="badge">{children}</span>
  ),
}))

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <button onClick={onClick} data-testid="dropdown-item">{children}</button>
  ),
  DropdownMenuTrigger: ({ children }: any) => <div data-testid="dropdown-trigger">{children}</div>,
}))

describe('PropertyCard', () => {
  it('should render property title', () => {
    render(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('Casa en Polanco')).toBeInTheDocument()
  })

  it('should render sale price for sale properties', () => {
    render(<PropertyCard property={mockProperty} />)
    // formatPrice should render the price with MXN formatting
    const priceEl = screen.getByText((content) => content.includes('5,000,000'))
    expect(priceEl).toBeInTheDocument()
  })

  it('should render rental price with /mes suffix for rent properties', () => {
    render(<PropertyCard property={mockRentalProperty} />)
    const priceEl = screen.getByText((content) => content.includes('/mes'))
    expect(priceEl).toBeInTheDocument()
  })

  it('should render bedroom count', () => {
    render(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should render bathroom count', () => {
    render(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('should render construction area', () => {
    render(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('180 m²')).toBeInTheDocument()
  })

  it('should render status badge with correct label', () => {
    render(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('Activa')).toBeInTheDocument()
  })

  it('should render status badge for sold properties', () => {
    const soldProperty = { ...mockProperty, status: 'sold' as const }
    render(<PropertyCard property={soldProperty} />)
    expect(screen.getByText('Vendida')).toBeInTheDocument()
  })

  it('should render status badge for rented properties', () => {
    const rentedProperty = { ...mockProperty, status: 'rented' as const }
    render(<PropertyCard property={rentedProperty} />)
    expect(screen.getByText('Rentada')).toBeInTheDocument()
  })

  it('should render status badge for reserved properties', () => {
    const reservedProperty = { ...mockProperty, status: 'reserved' as const }
    render(<PropertyCard property={reservedProperty} />)
    expect(screen.getByText('Reservada')).toBeInTheDocument()
  })

  it('should render status badge for draft properties', () => {
    const draftProperty = { ...mockProperty, status: 'draft' as const }
    render(<PropertyCard property={draftProperty} />)
    expect(screen.getByText('Borrador')).toBeInTheDocument()
  })

  it('should render operation type badge for sale', () => {
    render(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('Venta')).toBeInTheDocument()
  })

  it('should render operation type badge for rent', () => {
    render(<PropertyCard property={mockRentalProperty} />)
    expect(screen.getByText('Renta')).toBeInTheDocument()
  })

  it('should render address information', () => {
    render(<PropertyCard property={mockProperty} />)
    // The address renders as "{neighborhood}, {city}" - use a flexible matcher
    expect(screen.getByText((content, element) => {
      return element?.tagName === 'SPAN' && content.includes('Polanco')
    })).toBeInTheDocument()
  })

  it('should render health score', () => {
    render(<PropertyCard property={mockProperty} />)
    expect(screen.getByTestId('health-score')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('should render MLS badge when shared_in_mls is true', () => {
    render(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('MLS Activo')).toBeInTheDocument()
  })

  it('should not render MLS badge when shared_in_mls is false', () => {
    const noMlsProperty = { ...mockProperty, shared_in_mls: false }
    render(<PropertyCard property={noMlsProperty} />)
    expect(screen.queryByText('MLS Activo')).not.toBeInTheDocument()
  })

  it('should render property image', () => {
    render(<PropertyCard property={mockProperty} />)
    const img = screen.getByAltText('Casa en Polanco')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/photo1.jpg')
  })

  it('should render placeholder when no photos', () => {
    const noPhotoProperty = { ...mockProperty, photos: [] }
    render(<PropertyCard property={noPhotoProperty} />)
    const img = screen.getByAltText('Casa en Polanco')
    expect(img).toHaveAttribute('src', '/placeholder-property.jpg')
  })

  it('should call onView when title is clicked', async () => {
    const user = userEvent.setup()
    const onView = vi.fn()
    render(<PropertyCard property={mockProperty} onView={onView} />)

    await user.click(screen.getByText('Casa en Polanco'))
    expect(onView).toHaveBeenCalledWith(mockProperty)
  })

  it('should call onShare when share button is clicked', async () => {
    const user = userEvent.setup()
    const onShare = vi.fn()
    render(<PropertyCard property={mockProperty} onShare={onShare} />)

    // The share icon in the overlay
    const shareButtons = screen.getAllByTestId('icon-share')
    // Click the first share button (overlay)
    await user.click(shareButtons[0].closest('button')!)
    expect(onShare).toHaveBeenCalledWith(mockProperty)
  })

  it('should call onEdit from dropdown menu', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(<PropertyCard property={mockProperty} onEdit={onEdit} />)

    const editItem = screen.getByText('Editar').closest('button')!
    await user.click(editItem)
    expect(onEdit).toHaveBeenCalledWith(mockProperty)
  })

  it('should call onDelete from dropdown menu', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(<PropertyCard property={mockProperty} onDelete={onDelete} />)

    const deleteItem = screen.getByText('Eliminar').closest('button')!
    await user.click(deleteItem)
    expect(onDelete).toHaveBeenCalledWith(mockProperty)
  })

  it('should show N/A when sale_price is undefined', () => {
    const noPrice = { ...mockProperty, operation_type: 'sale' as const, sale_price: undefined }
    render(<PropertyCard property={noPrice} />)
    expect(screen.getByText('N/A')).toBeInTheDocument()
  })

  it('should show 0 for bedrooms when undefined', () => {
    const noBedrooms = { ...mockProperty, bedrooms: undefined }
    render(<PropertyCard property={noBedrooms} />)
    expect(screen.getByText('0', { selector: '[title="Recámaras"] span' })).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<PropertyCard property={mockProperty} className="custom-class" />)
    const card = screen.getByTestId('card')
    expect(card.className).toContain('custom-class')
  })
})
