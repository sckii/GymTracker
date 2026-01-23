import React from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { RefreshCw, X } from 'lucide-react'

function ReloadPrompt() {
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            // console.log('SW Registered: ' + r)
        },
        onRegisterError(error) {
            console.log('SW registration error', error)
        },
    })

    const close = () => {
        setOfflineReady(false)
        setNeedRefresh(false)
    }

    if (!offlineReady && !needRefresh) return null

    return (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col gap-2 max-w-sm animate-slide-up">
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <h3 className="font-bold text-gray-800">
                        {offlineReady ? 'App ready to work offline' : 'New content available'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {offlineReady
                            ? 'You can use this app without internet!'
                            : 'A new version is available. Refresh to update.'}
                    </p>
                </div>
                <button onClick={close} className="text-gray-400 hover:text-gray-600">
                    <X size={18} />
                </button>
            </div>

            {needRefresh && (
                <button
                    onClick={() => updateServiceWorker(true)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors mt-2"
                >
                    <RefreshCw size={16} />
                    Reload
                </button>
            )}
        </div>
    )
}

export default ReloadPrompt
