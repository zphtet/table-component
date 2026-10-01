/** Stores from /api/stores, each expanding into its stock from /api/stores/:storeId/stocks */
export const EcommerceStore = () => (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-8 sm:px-6">
        <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Ecommerce Stores
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Stores and their stock lists will show here.
            </p>
        </div>
    </div>
);
