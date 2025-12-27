import React, { useState, useEffect } from 'react';
import { Settings, Percent, Clock, Download, Save, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ConfigValue {
    key: string;
    value: string | number;
    label: string;
    description: string;
    type: 'percent' | 'days' | 'number';
    icon: React.ReactNode;
}

const AdminSettings: React.FC = () => {
    const [configs, setConfigs] = useState<ConfigValue[]>([
        { key: 'commission_rate', value: 0.15, label: 'Commission Rate', description: 'Platform commission on each sale', type: 'percent', icon: <Percent size={18} /> },
        { key: 'payout_delay_days', value: 3, label: 'Payout Delay', description: 'Days before seller receives payout', type: 'days', icon: <Clock size={18} /> },
        { key: 'max_downloads_per_order', value: 10, label: 'Max Downloads', description: 'Download limit per order', type: 'number', icon: <Download size={18} /> },
    ]);
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const fetchConfigs = async () => {
            try {
                const { data, error } = await supabase
                    .from('platform_config')
                    .select('*');

                if (error) throw error;

                if (data) {
                    setConfigs(prev => prev.map(config => {
                        const dbConfig = data.find(d => d.key === config.key);
                        return dbConfig ? { ...config, value: dbConfig.value } : config;
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch configs:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConfigs();
    }, []);

    const handleChange = (key: string, value: string) => {
        setSaved(false);
        setConfigs(prev => prev.map(config =>
            config.key === key
                ? { ...config, value: config.type === 'percent' ? parseFloat(value) / 100 : parseInt(value) }
                : config
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            for (const config of configs) {
                const { error } = await supabase
                    .from('platform_config')
                    .upsert({
                        key: config.key,
                        value: config.value,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'key' });

                if (error) throw error;
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Failed to save configs:', err);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-bold text-textMain mb-2">Platform Settings</h1>
                <p className="text-textMuted">Configure marketplace commission and policies</p>
            </div>

            {/* Warning */}
            <div className="p-4 rounded-xl bg-accent-secondary/10 border border-accent-secondary/20 flex items-start gap-3">
                <AlertTriangle size={20} className="text-accent-secondary-fg mt-0.5" />
                <div>
                    <p className="font-medium text-textMain">Changes affect new orders only</p>
                    <p className="text-sm text-textMuted">
                        Existing orders will retain their original commission rate and settings.
                    </p>
                </div>
            </div>

            {/* Settings Cards */}
            <div className="space-y-4">
                {configs.map((config) => (
                    <div
                        key={config.key}
                        className="p-6 bg-surface border border-border rounded-2xl"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-accent-primary/10 text-accent-primary">
                                {config.icon}
                            </div>
                            <div className="flex-1">
                                <label className="font-bold text-textMain block mb-1">
                                    {config.label}
                                </label>
                                <p className="text-sm text-textMuted mb-4">
                                    {config.description}
                                </p>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={config.type === 'percent' ? Math.round(Number(config.value) * 100) : config.value}
                                        onChange={(e) => handleChange(config.key, e.target.value)}
                                        min={config.type === 'percent' ? 1 : 1}
                                        max={config.type === 'percent' ? 50 : 100}
                                        className="w-24 px-4 py-2 bg-surfaceHighlight border border-border rounded-xl text-textMain text-center font-medium focus:outline-none focus:border-accent-primary"
                                    />
                                    <span className="text-textMuted">
                                        {config.type === 'percent' && '%'}
                                        {config.type === 'days' && 'days'}
                                        {config.type === 'number' && 'downloads'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-accent-primary text-accent-primary-fg font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {saved && (
                    <span className="text-accent-primary font-medium animate-fade-in">
                        ✓ Changes saved successfully
                    </span>
                )}
            </div>
        </div>
    );
};

export default AdminSettings;
