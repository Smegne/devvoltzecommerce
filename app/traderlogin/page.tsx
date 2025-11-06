import TraderLogin from '@/components/traderlogin';

export default function TraderLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Trader Login
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Access your trader dashboard to manage your products and orders
          </p>
        </div>
        <TraderLogin />
      </div>
    </div>
  );
}