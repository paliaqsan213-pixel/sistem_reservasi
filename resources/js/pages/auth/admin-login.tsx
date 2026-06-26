import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle } from 'lucide-react';

export default function AdminLogin() {
    return (
        <>
            <Head title="Admin Log In" />

            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/30 dark:bg-orange-950/20">
                <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0" />
                    <div>
                        <h4 className="font-semibold text-orange-850 dark:text-orange-300 text-sm">
                            Peringatan Administrator
                        </h4>
                        <p className="text-xs text-orange-700 dark:text-orange-400 mt-1 font-medium">
                            Halaman khusus administrator. Akses tidak sah akan tercatat.
                        </p>
                    </div>
                </div>
            </div>

            <Form
                action="/admin/login"
                method="post"
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="admin@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">Remember me</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm transition-colors"
                                tabIndex={4}
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Log in as Admin
                            </Button>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

AdminLogin.layout = {
    title: 'Admin Log In',
    description: 'Enter your credentials to access the admin panel',
};
