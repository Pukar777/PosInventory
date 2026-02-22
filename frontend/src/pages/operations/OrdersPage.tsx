import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, Clock, ChefHat, Truck, XCircle, Plus, AlertOctagon } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useApi } from '@/hooks/useApi'
import { useSettingsStore } from '@/store/settingsStore'
import { toast } from 'sonner'

type OrderStatus = 'pending' | 'preparing' | 'delivered' | 'cancelled'

interface OrderItem {
    id: number
    quantity: number
    unit_price: number
    menu_item: { name: string }
}

interface Order {
    id: number
    status: OrderStatus
    source: string
    total_amount: number
    created_at: string
    table: { number: number }
    user: { name: string } | null
    order_items: OrderItem[]
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ReactNode; className: string }> = {
    pending: {
        label: 'Pending',
        icon: <Clock className="w-3 h-3" />,
        className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    preparing: {
        label: 'Preparing',
        icon: <ChefHat className="w-3 h-3" />,
        className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    delivered: {
        label: 'Delivered',
        icon: <Truck className="w-3 h-3" />,
        className: 'bg-green-500/20 text-green-400 border-green-500/30',
    },
    cancelled: {
        label: 'Cancelled',
        icon: <XCircle className="w-3 h-3" />,
        className: 'bg-destructive/20 text-destructive border-destructive/30',
    },
}

function StatusBadge({ status }: { status: OrderStatus }) {
    const config = STATUS_CONFIG[status]
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${config.className}`}>
            {config.icon}
            {config.label}
        </span>
    )
}

type TimeFilter = '15mins' | '30mins' | '45mins' | '60mins' | '120mins' | '3hrs' | '5hrs' | '8hrs' | '10hrs' | 'Today' | 'Week'
export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<number | null>(null)
    const { request } = useApi()
    const { getSettingValue } = useSettingsStore()
    const currency = getSettingValue('currency_symbol', '$')
    const defaultTimeFilter = (getSettingValue('default_time_filter', '30mins') as TimeFilter)
    const [timeFilter, setTimeFilter] = useState<TimeFilter>(defaultTimeFilter)

    useEffect(() => {
        setTimeFilter(defaultTimeFilter)
    }, [defaultTimeFilter])
    const getElapsedMinutes = useCallback((dateStr: string) => {
        const createdTime = new Date(dateStr).getTime()
        const now = new Date().getTime()
        return Math.floor((now - createdTime) / 60000)
    }, [])

    const getCriticalMinutes = (filter: string) => {
        if (filter.endsWith('mins')) return parseInt(filter);
        if (filter.endsWith('hrs')) return parseInt(filter) * 60;
        if (filter === 'Today') return 24 * 60;
        if (filter === 'Week') return 7 * 24 * 60;
        return 30;
    }
    const criticalMinutes = getCriticalMinutes(timeFilter)
    const criticalOrders = orders.filter(o =>
        (o.status === 'pending' || o.status === 'preparing') &&
        getElapsedMinutes(o.created_at) >= criticalMinutes
    ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

    const regularOrders = orders.filter(o => !criticalOrders.some(co => co.id === o.id))

    const fetchOrders = useCallback(async () => {
        try {
            setIsLoading(true)
            const res = await request<Order[]>({ url: `/orders?time_filter=${timeFilter}`, method: 'GET' })
            setOrders(res.data)
        } catch {
            toast.error('Failed to load orders')
        } finally {
            setIsLoading(false)
        }
    }, [timeFilter, request])

    useEffect(() => {
        fetchOrders()
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchOrders, 30000)
        return () => clearInterval(interval)
    }, [fetchOrders])

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        setUpdatingId(orderId)
        try {
            await request({
                url: `/orders/${orderId}/status`,
                method: 'PATCH',
                data: { status: newStatus },
            })
            setOrders((prev) =>
                prev.map((o) =>
                    o.id === orderId ? { ...o, status: newStatus as OrderStatus } : o
                )
            )
            toast.success(`Order #${orderId} → ${newStatus}`)
        } catch {
            toast.error('Failed to update status')
        } finally {
            setUpdatingId(null)
        }
    }

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr)
        const today = new Date()
        if (d.toDateString() === today.toDateString()) return 'Today'
        return d.toLocaleDateString()
    }

    return (
        <div className="space-y-6 pt-4 md:pt-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-mono tracking-tight text-primary">Orders</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Live order management — auto-refreshes every 30s.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Select value={timeFilter} onValueChange={(val) => setTimeFilter(val as TimeFilter)}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <Clock className="w-4 h-4 mr-2 shrink-0" />
                            <span className="truncate flex-1 text-left"><SelectValue placeholder="Time filter" /></span>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="15mins">15 Minutes</SelectItem>
                            <SelectItem value="30mins">30 Minutes</SelectItem>
                            <SelectItem value="45mins">45 Minutes</SelectItem>
                            <SelectItem value="60mins">1 Hour</SelectItem>
                            <SelectItem value="120mins">2 Hours</SelectItem>
                            <SelectItem value="Today">Today</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={fetchOrders} className="gap-2 w-full sm:w-auto">
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button asChild className="gap-2 w-full sm:w-auto">
                        <Link to="/operations/new-order">
                            <Plus className="w-4 h-4" />
                            New Order
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['pending', 'preparing', 'delivered', 'cancelled'] as OrderStatus[]).map((status) => {
                    const count = orders.filter((o) => o.status === status).length
                    return (
                        <div key={status} className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4">
                            <div className="mb-2">
                                <StatusBadge status={status} />
                            </div>
                            <p className="text-2xl font-bold">{count}</p>
                        </div>
                    )
                })}
            </div>

            {/* Critical Orders Section */}
            {criticalOrders.length > 0 && (
                <div className="rounded-xl border border-destructive/50 bg-destructive/5 overflow-hidden shadow-sm overflow-x-auto mb-6">
                    <div className="bg-destructive/10 px-4 py-3 border-b border-destructive/20 flex items-center gap-2">
                        <AlertOctagon className="w-5 h-5 text-destructive" />
                        <h2 className="font-bold text-destructive">Critical Orders — Action Required</h2>
                    </div>
                    <Table className="min-w-[700px]">
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-destructive/20">
                                <TableHead className="w-16">#</TableHead>
                                <TableHead>Table</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Waiter</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Time (Elapsed)</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {criticalOrders.map((order) => (
                                <TableRow key={`critical-${order.id}`} className="bg-destructive/5 hover:bg-destructive/10 border-destructive/10">
                                    <TableCell className="font-mono text-destructive text-xs">#{order.id}</TableCell>
                                    <TableCell className="font-bold text-destructive">Table {order.table?.number ?? '—'}</TableCell>
                                    <TableCell className="text-xs text-destructive/80 max-w-[200px]">
                                        {order.order_items?.map((i) => (
                                            <span key={i.id} className="block truncate">
                                                {i.quantity}× {i.menu_item?.name}
                                            </span>
                                        ))}
                                    </TableCell>
                                    <TableCell className="text-sm text-destructive">{order.user?.name ?? 'QR'}</TableCell>
                                    <TableCell className="font-semibold text-destructive">
                                        {currency}{Number(order.total_amount).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-xs text-destructive">
                                        <span className="font-bold">{getElapsedMinutes(order.created_at)} mins ago</span><br />
                                        <span>{formatTime(order.created_at)}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={order.status}
                                            onValueChange={(val) => handleStatusChange(order.id, val)}
                                            disabled={updatingId === order.id}
                                        >
                                            <SelectTrigger className="h-8 w-[140px] text-xs border-destructive/30">
                                                <span className="truncate flex-1 text-left"><SelectValue /></span>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="preparing">Preparing</SelectItem>
                                                <SelectItem value="delivered">Delivered</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Table */}
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden shadow-sm overflow-x-auto">
                <Table className="min-w-[700px]">
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-16">#</TableHead>
                            <TableHead>Table</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Waiter</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    Loading orders...
                                </TableCell>
                            </TableRow>
                        ) : regularOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No regular orders.
                                </TableCell>
                            </TableRow>
                        ) : (
                            regularOrders.map((order) => (
                                <TableRow key={order.id} className={order.status === 'cancelled' ? 'opacity-50' : ''}>
                                    <TableCell className="font-mono text-muted-foreground text-xs">#{order.id}</TableCell>
                                    <TableCell className="font-bold">Table {order.table?.number ?? '—'}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground max-w-[200px]">
                                        {order.order_items?.map((i) => (
                                            <span key={i.id} className="block truncate">
                                                {i.quantity}× {i.menu_item?.name}
                                            </span>
                                        ))}
                                    </TableCell>
                                    <TableCell className="text-sm">{order.user?.name ?? 'QR'}</TableCell>
                                    <TableCell className="font-semibold text-primary">
                                        {currency}{Number(order.total_amount).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        <span>{formatDate(order.created_at)}</span><br />
                                        <span className="font-medium text-foreground">{formatTime(order.created_at)}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={order.status}
                                            onValueChange={(val) => handleStatusChange(order.id, val)}
                                            disabled={updatingId === order.id || order.status === 'delivered' || order.status === 'cancelled'}
                                        >
                                            <SelectTrigger className="h-8 w-[140px] text-xs">
                                                <span className="truncate flex-1 text-left"><SelectValue /></span>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="preparing">Preparing</SelectItem>
                                                <SelectItem value="delivered">Delivered</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
