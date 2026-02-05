'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { useAgencyUsers } from '@/hooks/useAgencyUsers'
import { Search } from 'lucide-react'

interface AgentSelectModalProps {
  open: boolean
  onClose: () => void
  title: string
  selectedId: string | null
  onSelect: (user: { id: string; full_name: string }) => void
}

export function AgentSelectModal({
  open,
  onClose,
  title,
  selectedId,
  onSelect,
}: AgentSelectModalProps) {
  const [search, setSearch] = useState('')
  const [pendingId, setPendingId] = useState<string | null>(selectedId)
  const { data: users = [], isLoading } = useAgencyUsers()

  useEffect(() => {
    if (open) setPendingId(selectedId)
  }, [open, selectedId])

  const filtered = search.trim()
    ? users.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users

  const handleSelect = () => {
    if (!pendingId) return
    const user = users.find((u) => u.id === pendingId)
    if (user) {
      onSelect({ id: user.id, full_name: user.full_name ?? '' })
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="rounded-3xl max-w-md max-h-[85vh] flex flex-col p-0 overflow-hidden duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold text-gray-900">{title}</DialogTitle>
        </DialogHeader>
        <div className="px-6 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar asesor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl border-gray-200"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-[200px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Ningún usuario activo en tu inmobiliaria.</p>
          ) : (
            <ul className="space-y-1">
              {filtered.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => setPendingId(user.id)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 transition-colors text-left"
                  >
                    <Checkbox
                      checked={pendingId === user.id}
                      onCheckedChange={() => setPendingId(pendingId === user.id ? null : user.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-shrink-0"
                    />
                    <Avatar className="h-10 w-10 rounded-full border border-gray-200 flex-shrink-0">
                      <AvatarImage src={user.avatar_url ?? undefined} />
                      <AvatarFallback className="rounded-full bg-gray-200 text-gray-700 text-sm">
                        {(user.full_name ?? user.email ?? '?').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{user.full_name}</p>
                      {user.email && (
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <DialogFooter className="p-6 pt-0 border-t border-gray-100">
          <Button
            onClick={handleSelect}
            disabled={!pendingId}
            className="w-full sm:w-auto rounded-xl bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold shadow-sm"
          >
            Seleccionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
