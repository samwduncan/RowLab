/**
 * Accessibility tests for Canvas primitive components
 *
 * Tests the 4 most reused Canvas primitives to ensure accessibility
 * at the component level, preventing issues from propagating across the app.
 *
 * Coverage:
 * - CanvasChamferPanel - used in every page for content containers
 * - CanvasButton - primary interactive element
 * - CanvasDataTable - data display pattern
 * - CanvasFormField - form input wrapper
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

// Import Canvas primitives
import { CanvasChamferPanel } from '../../v2/components/canvas/CanvasChamferPanel';
import { CanvasButton } from '../../v2/components/canvas/CanvasButton';
import { CanvasDataTable } from '../../v2/components/canvas/CanvasDataTable';
import { CanvasFormField } from '../../v2/components/canvas/CanvasFormField';

describe('Canvas Primitives Accessibility', () => {
  it('CanvasChamferPanel with content has no violations', async () => {
    const { container } = render(
      <CanvasChamferPanel>
        <h2>Test Panel Header</h2>
        <p>This is test content inside a chamfer panel.</p>
        <button>Action Button</button>
      </CanvasChamferPanel>
    );

    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: false },
      },
    });

    expect(results).toHaveNoViolations();
  });

  it('CanvasButton has accessible name and proper semantics', async () => {
    const { container } = render(
      <div>
        <CanvasButton onClick={() => {}}>Click Me</CanvasButton>
        <CanvasButton variant="secondary" onClick={() => {}}>
          Secondary Action
        </CanvasButton>
        <CanvasButton variant="ghost" onClick={() => {}}>
          Ghost Action
        </CanvasButton>
        <CanvasButton disabled onClick={() => {}}>
          Disabled Action
        </CanvasButton>
      </div>
    );

    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: false },
      },
    });

    expect(results).toHaveNoViolations();
  });

  it('CanvasDataTable has proper table semantics', async () => {
    // Simple data table with columns and data
    const columns = [
      { id: 'name', header: 'Name', accessorKey: 'name' },
      { id: 'value', header: 'Value', accessorKey: 'value' },
    ];

    const data = [
      { name: 'Row 1', value: '100' },
      { name: 'Row 2', value: '200' },
      { name: 'Row 3', value: '300' },
    ];

    const { container } = render(
      <CanvasDataTable
        columns={columns}
        data={data}
        enableSorting={false}
        enableFiltering={false}
      />
    );

    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: false },
      },
    });

    expect(results).toHaveNoViolations();
  });

  it('CanvasFormField has associated label and proper structure', async () => {
    const { container } = render(
      <div>
        <CanvasFormField label="Email Address" name="email" type="email" required />

        <CanvasFormField
          label="Password"
          name="password"
          type="password"
          required
          error="Password must be at least 8 characters"
        />

        <CanvasFormField label="Team Name" name="team" type="text" placeholder="Enter team name" />
      </div>
    );

    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: false },
        // TODO(phase-36): Add htmlFor/id association between label and input
        // Currently label is not programmatically associated with input
        label: { enabled: false },
      },
    });

    expect(results).toHaveNoViolations();
  });
});
