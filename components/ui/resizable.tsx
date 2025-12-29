'use client'

import * as React from 'react'
import { GripVerticalIcon } from 'lucide-react'
import * as ResizablePanels from 'react-resizable-panels'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  NOTE:
    react-resizable-panels v1 does NOT type-export PanelGroup, Panel,
    PanelResizeHandle — but they DO exist at runtime.
    We intentionally cast to `any` to stay compatible.
*/
/* ------------------------------------------------------------------ */

const PanelGroup = (ResizablePanels as any).PanelGroup
const Panel = (ResizablePanels as any).Panel
const PanelResizeHandle = (ResizablePanels as any).PanelResizeHandle

/* ---------------------------- Panel Group --------------------------- */

type ResizablePanelGroupProps = {
  children: React.ReactNode
  className?: string
  direction?: 'horizontal' | 'vertical'
}

function ResizablePanelGroup({
  children,
  className,
  direction = 'horizontal',
}: ResizablePanelGroupProps) {
  return (
    <PanelGroup
      direction={direction}
      data-slot="resizable-panel-group"
      className={cn(
        'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
        className,
      )}
    >
      {children}
    </PanelGroup>
  )
}

/* ------------------------------- Panel ------------------------------ */

type ResizablePanelProps = {
  children: React.ReactNode
  defaultSize?: number
  minSize?: number
  maxSize?: number
  className?: string
}

function ResizablePanel({
  children,
  ...props
}: ResizablePanelProps) {
  return (
    <Panel data-slot="resizable-panel" {...props}>
      {children}
    </Panel>
  )
}

/* ------------------------------ Handle ------------------------------ */

type ResizableHandleProps = {
  withHandle?: boolean
  className?: string
}

function ResizableHandle({
  withHandle,
  className,
}: ResizableHandleProps) {
  return (
    <PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        'bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90',
        className,
      )}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }

