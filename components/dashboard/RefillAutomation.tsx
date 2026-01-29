import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { 
  RefreshCw, 
  Clock,
  User,
  Package,
  Send,
  CheckCircle
} from 'lucide-react';
import type { Order } from '@/types';
import { differenceInDays } from 'date-fns';

interface RefillAutomationProps {
  orders: Order[];
}

export function RefillAutomation({ orders }: RefillAutomationProps) {
  // Filter orders that need refill reminders
  const refillDueOrders = orders.filter(order => {
    if (!order.refill_due_date) return false;
    const daysUntilRefill = differenceInDays(new Date(order.refill_due_date), new Date());
    return daysUntilRefill <= 7 && daysUntilRefill > -7; // Show 7 days before and after
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-green-50 to-teal-50">
        <CardTitle className="flex items-center gap-2 text-green-800">
          <RefreshCw className="w-5 h-5 text-green-600" />
          🔄 Refill Reminder Automation
        </CardTitle>
        <Badge variant="success">{refillDueOrders.length} Due</Badge>
      </CardHeader>
      <CardContent className="p-0">
        {refillDueOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Koi refill reminder pending nahi hai</p>
          </div>
        ) : (
          <div className="divide-y">
            {refillDueOrders.map((order) => {
              const daysUntilRefill = differenceInDays(new Date(order.refill_due_date!), new Date());
              const isOverdue = daysUntilRefill < 0;

              return (
                <div key={order.id} className={`p-4 hover:bg-gray-50 ${isOverdue ? 'bg-red-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    {/* Customer Info */}
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isOverdue ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        <User className={`w-5 h-5 ${isOverdue ? 'text-red-600' : 'text-green-600'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{order.shipping_name}</p>
                        <p className="text-sm text-gray-500">{order.shipping_phone}</p>
                        <p className="text-xs text-gray-400">{order.shipping_city}</p>
                      </div>
                    </div>

                    {/* Order Info */}
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                      <p className="text-xs text-gray-500">₹{order.total_amount.toLocaleString('en-IN')}</p>
                    </div>

                    {/* Refill Status */}
                    <div className="text-right">
                      {isOverdue ? (
                        <Badge variant="danger" className="animate-pulse">
                          <Clock className="w-3 h-3 mr-1" />
                          {Math.abs(daysUntilRefill)} din pehle due tha!
                        </Badge>
                      ) : daysUntilRefill === 0 ? (
                        <Badge variant="warning">
                          <Clock className="w-3 h-3 mr-1" />
                          Aaj due hai!
                        </Badge>
                      ) : (
                        <Badge variant="success">
                          <Clock className="w-3 h-3 mr-1" />
                          {daysUntilRefill} din mein due
                        </Badge>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="whatsapp"
                        icon={<Send className="w-3 h-3" />}
                        onClick={() => {
                          const message = encodeURIComponent(
                            `${order.shipping_name} ji, kaise hain aap? 🙏\n\nLagta hai aapka product ab khatam hone wala hai!\n\nRefill order kar dein?\n\n🎁 15% OFF on refill\n🚚 FREE Delivery\n\nReply karein "REFILL" aur hum order process kar denge! 🌿`
                          );
                          window.open(`https://wa.me/91${order.shipping_phone}?text=${message}`, '_blank');
                        }}
                      >
                        Send Reminder
                      </Button>
                    </div>
                  </div>

                  {/* AI Suggested Message Preview */}
                  <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600 font-medium mb-1">🤖 Auto Message:</p>
                    <p className="text-sm text-green-800">
                      "{order.shipping_name} ji, aapka product ab khatam hone wala hai! 
                      Refill order kar dein? 15% OFF + FREE Delivery! 🌿"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Automation Settings */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Auto-Refill Reminders</h4>
              <p className="text-sm text-gray-500">7 din pehle automatic WhatsApp bhejta hai</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="success">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
