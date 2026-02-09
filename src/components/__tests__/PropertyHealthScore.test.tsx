import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PropertyHealthScore } from '../properties/PropertyHealthScore'

// Mock lucide-react
vi.mock('lucide-react', () => ({
  Info: () => <span data-testid="icon-info">Info</span>,
  CheckCircle2: () => <span data-testid="icon-check">Check</span>,
  Circle: () => <span data-testid="icon-circle">Circle</span>,
  AlertCircle: () => <span data-testid="icon-alert">Alert</span>,
}))

// Mock UI components
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipContent: ({ children }: any) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, variant }: any) => (
    <span className={className} data-testid="health-badge">{children}</span>
  ),
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="health-card">{children}</div>,
}))

vi.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: any) => (
    <div data-testid="progress" data-value={value} className={className} />
  ),
}))

describe('PropertyHealthScore', () => {
  describe('Simple badge view', () => {
    it('should render score as badge', () => {
      render(<PropertyHealthScore score={85} />)
      expect(screen.getByText('85%')).toBeInTheDocument()
    })

    it('should apply green color for score >= 80', () => {
      render(<PropertyHealthScore score={85} />)
      const badge = screen.getByTestId('health-badge')
      expect(badge.className).toContain('green')
    })

    it('should apply yellow color for score >= 60', () => {
      render(<PropertyHealthScore score={65} />)
      const badge = screen.getByTestId('health-badge')
      expect(badge.className).toContain('yellow')
    })

    it('should apply red color for score < 60', () => {
      render(<PropertyHealthScore score={40} />)
      const badge = screen.getByTestId('health-badge')
      expect(badge.className).toContain('red')
    })

    it('should show "Excelente" tooltip for score >= 80', () => {
      render(<PropertyHealthScore score={85} />)
      expect(screen.getByText('Health Score: Excelente')).toBeInTheDocument()
    })

    it('should show "Bueno" tooltip for score >= 60', () => {
      render(<PropertyHealthScore score={70} />)
      expect(screen.getByText('Health Score: Bueno')).toBeInTheDocument()
    })

    it('should show "Mejorar" tooltip for score < 60', () => {
      render(<PropertyHealthScore score={30} />)
      expect(screen.getByText('Health Score: Mejorar')).toBeInTheDocument()
    })
  })

  describe('Detailed view with breakdown', () => {
    const mockBreakdown = {
      items: {
        photos: {
          completed: true,
          points: 25,
          max_points: 25,
          current_count: 5,
          target_count: 5,
        },
        description: {
          completed: false,
          points: 10,
          max_points: 20,
          current_length: 50,
          target_length: 200,
        },
        coordinates: {
          completed: false,
          points: 0,
          max_points: 15,
        },
      },
      suggestions: [
        'Agrega más fotos',
        'Completa la descripción',
      ],
    }

    it('should render detailed card when showDetails is true', () => {
      render(
        <PropertyHealthScore
          score={75}
          showDetails={true}
          breakdown={mockBreakdown}
        />
      )
      expect(screen.getByTestId('health-card')).toBeInTheDocument()
      expect(screen.getByText('Health Score')).toBeInTheDocument()
    })

    it('should render detailed card when breakdown is provided', () => {
      render(
        <PropertyHealthScore
          score={75}
          breakdown={mockBreakdown}
        />
      )
      expect(screen.getByTestId('health-card')).toBeInTheDocument()
    })

    it('should show score label in detailed view', () => {
      render(
        <PropertyHealthScore
          score={75}
          showDetails={true}
          breakdown={mockBreakdown}
        />
      )
      expect(screen.getByText('Bueno')).toBeInTheDocument()
    })

    it('should show toggle button for details', () => {
      render(
        <PropertyHealthScore
          score={75}
          breakdown={mockBreakdown}
        />
      )
      expect(screen.getByText('Ver detalles')).toBeInTheDocument()
    })

    it('should expand breakdown on click', async () => {
      const user = userEvent.setup()

      render(
        <PropertyHealthScore
          score={75}
          breakdown={mockBreakdown}
        />
      )

      await user.click(screen.getByText('Ver detalles'))

      expect(screen.getByText('Desglose:')).toBeInTheDocument()
      expect(screen.getByText('Fotos')).toBeInTheDocument()
      expect(screen.getByText('Descripción')).toBeInTheDocument()
      expect(screen.getByText('Ubicación GPS')).toBeInTheDocument()
    })

    it('should show suggestions when expanded', async () => {
      const user = userEvent.setup()

      render(
        <PropertyHealthScore
          score={75}
          breakdown={mockBreakdown}
        />
      )

      await user.click(screen.getByText('Ver detalles'))

      expect(screen.getByText('Agrega más fotos')).toBeInTheDocument()
      expect(screen.getByText('Completa la descripción')).toBeInTheDocument()
    })

    it('should show warning when score < 60', async () => {
      const user = userEvent.setup()

      render(
        <PropertyHealthScore
          score={45}
          breakdown={mockBreakdown}
        />
      )

      await user.click(screen.getByText('Ver detalles'))

      expect(screen.getByText((content) =>
        content.includes('60%') && content.includes('publicar')
      )).toBeInTheDocument()
    })

    it('should not show warning when score >= 60', async () => {
      const user = userEvent.setup()

      render(
        <PropertyHealthScore
          score={75}
          breakdown={mockBreakdown}
        />
      )

      await user.click(screen.getByText('Ver detalles'))

      expect(screen.queryByText((content) =>
        content.includes('60%') && content.includes('publicar')
      )).not.toBeInTheDocument()
    })

    it('should toggle between expanded and collapsed', async () => {
      const user = userEvent.setup()

      render(
        <PropertyHealthScore
          score={75}
          breakdown={mockBreakdown}
        />
      )

      // Expand
      await user.click(screen.getByText('Ver detalles'))
      expect(screen.getByText('Ocultar')).toBeInTheDocument()

      // Collapse
      await user.click(screen.getByText('Ocultar'))
      expect(screen.getByText('Ver detalles')).toBeInTheDocument()
    })

    it('should render progress bars for each item', async () => {
      const user = userEvent.setup()

      render(
        <PropertyHealthScore
          score={75}
          breakdown={mockBreakdown}
        />
      )

      await user.click(screen.getByText('Ver detalles'))

      const progressBars = screen.getAllByTestId('progress')
      expect(progressBars.length).toBe(3)
    })

    it('should show points for each item', async () => {
      const user = userEvent.setup()

      render(
        <PropertyHealthScore
          score={75}
          breakdown={mockBreakdown}
        />
      )

      await user.click(screen.getByText('Ver detalles'))

      expect(screen.getByText('25/25 pts')).toBeInTheDocument()
      expect(screen.getByText('10/20 pts')).toBeInTheDocument()
      expect(screen.getByText('0/15 pts')).toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it('should render with sm size', () => {
      render(<PropertyHealthScore score={80} showDetails={true} />)
      // Component should render without errors
      expect(screen.getByText('80')).toBeInTheDocument()
    })

    it('should render with lg size', () => {
      render(<PropertyHealthScore score={80} size="lg" showDetails={true} />)
      expect(screen.getByText('80')).toBeInTheDocument()
    })
  })
})
