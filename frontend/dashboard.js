document.addEventListener('DOMContentLoaded', () => {
    const activePlanData = localStorage.getItem('trialPlan');
    const planRaw = activePlanData || '{}';
    const planActivated = Boolean(activePlanData);
    let planObj = {};
    try { planObj = JSON.parse(planRaw); } catch (e) { planObj = {}; }
    const plan = (planObj.plan || 'starter').toLowerCase();
    const price = planObj.price || '$0';

    const planLabel = document.getElementById('planLabel');
    const planFeatures = document.getElementById('planFeatures');
    const planStatusNotice = document.getElementById('planStatusNotice');
    const planFeatureCards = document.getElementById('planFeatureCards');
    const featuresList = document.getElementById('featuresList');
    const accountInfo = document.getElementById('accountInfo');
    const eventLimitInfo = document.getElementById('eventLimitInfo');
    const signOutBtn = document.getElementById('signOutBtn');
    const toastEl = document.getElementById('toast');
    const toastMessageEl = document.getElementById('toastMessage');

    const showToast = (message, type = 'success') => {
        if (!toastEl || !toastMessageEl) return;
        toastMessageEl.textContent = message;
        toastEl.classList.remove('hidden');
        toastEl.style.opacity = '1';
        toastEl.style.transition = 'opacity 0.3s ease';
        if (type === 'error') {
            toastEl.querySelector('#toastInner').style.backgroundColor = 'rgba(140, 20, 20, 0.9)';
        } else {
            toastEl.querySelector('#toastInner').style.backgroundColor = 'rgba(31, 41, 55, 0.95)';
        }
        window.setTimeout(() => {
            toastEl.style.opacity = '0';
            window.setTimeout(() => toastEl.classList.add('hidden'), 300);
        }, 2400);
    };

    const planConfigs = {
        starter: {
            label: 'Starter',
            features: [
                'Up to 50 attendees',
                '1 event per month',
                'Basic analytics',
                'Email support'
            ],
            summary: [
                'Event creation limited to 1 event per month',
                'Basic analytics dashboard access',
                'Email support only',
                'Branding and integrations locked'
            ],
            allowBranding: false,
            allowIntegrations: false,
            allowPrioritySupport: false,
            allowUnlimitedEvents: false,
            analyticsLevel: 'basic'
        },
        professional: {
            label: 'Professional',
            features: [
                'Up to 500 attendees',
                'Unlimited events',
                'Advanced analytics',
                'Priority support',
                'Custom branding'
            ],
            summary: [
                'Unlimited event creation',
                'Advanced analytics charts',
                'Priority email support',
                'Custom branding access'
            ],
            allowBranding: true,
            allowIntegrations: false,
            allowPrioritySupport: true,
            allowUnlimitedEvents: true,
            analyticsLevel: 'advanced'
        },
        enterprise: {
            label: 'Enterprise',
            features: [
                'Unlimited attendees',
                'Unlimited events',
                'Custom integrations',
                'Dedicated manager',
                'SLA guarantee'
            ],
            summary: [
                'Unlimited event creation',
                'Advanced analytics charts',
                'Custom integrations and webhooks',
                'Dedicated account manager',
                'Service-level guarantees'
            ],
            allowBranding: true,
            allowIntegrations: true,
            allowPrioritySupport: true,
            allowUnlimitedEvents: true,
            analyticsLevel: 'advanced'
        }
    };

    const selectedPlan = planConfigs[plan] || planConfigs.starter;
    if (planLabel) {
        planLabel.textContent = planActivated ? `${selectedPlan.label.toUpperCase()} • ${price}` : 'No active plan';
    }

    const storedUser = localStorage.getItem('eventflow-user');
    if (accountInfo) accountInfo.textContent = storedUser ? `Signed in as ${JSON.parse(storedUser).firstName || JSON.parse(storedUser).email || 'User'}` : 'Guest (trial)';

    if (planStatusNotice) {
        planStatusNotice.textContent = planActivated
            ? `Your ${selectedPlan.label} plan is active. Dashboard features have been unlocked based on your selection.`
            : 'No plan has been selected yet. Choose a perfect plan first to unlock more dashboard capability.';
        planStatusNotice.classList.remove('hidden');
        planStatusNotice.classList.toggle('bg-primary-500/10', planActivated);
        planStatusNotice.classList.toggle('border-primary-500/20', planActivated);
        planStatusNotice.classList.toggle('text-primary-100', planActivated);
        planStatusNotice.classList.toggle('bg-yellow-500/10', !planActivated);
        planStatusNotice.classList.toggle('border-yellow-400/20', !planActivated);
        planStatusNotice.classList.toggle('text-yellow-100', !planActivated);
    }

    if (planFeatures) {
        planFeatures.innerHTML = '';
        if (planActivated) {
            selectedPlan.features.forEach(f => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fas fa-check text-green-400 mr-2"></i>${f}`;
                planFeatures.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.className = 'text-gray-300';
            li.textContent = 'Select a plan from the pricing page to unlock feature details.';
            planFeatures.appendChild(li);
        }
    }

    if (featuresList) {
        featuresList.innerHTML = '';
        if (planActivated) {
            selectedPlan.summary.forEach(f => {
                const card = document.createElement('div');
                card.className = 'p-4 bg-white/5 rounded';
                card.innerHTML = `<div class="font-semibold">${f}</div><div class="text-sm text-gray-300 mt-2">${getFeatureDescription(f)}</div>`;
                featuresList.appendChild(card);
            });
        } else {
            const card = document.createElement('div');
            card.className = 'p-4 bg-white/5 rounded';
            card.innerHTML = '<div class="font-semibold">Plan features are locked</div><div class="text-sm text-gray-300 mt-2">Choose a perfect plan and complete the activation to unlock dashboard feature cards and analytics.</div>';
            featuresList.appendChild(card);
        }
    }

    const planSummary = document.getElementById('planSummary');
    if (planSummary) {
        planSummary.innerHTML = '';
        if (planActivated) {
            selectedPlan.summary.forEach(text => {
                const item = document.createElement('div');
                item.textContent = `• ${text}`;
                planSummary.appendChild(item);
            });
        } else {
            const item = document.createElement('div');
            item.textContent = 'Your plan summary will appear once you choose and activate a plan.';
            planSummary.appendChild(item);
        }
    }

    const createButton = document.getElementById('dashCreateBtn');
    let currentEventCount = 0;
    const eventLimit = selectedPlan.allowUnlimitedEvents ? Infinity : 1;
    const isCreateAllowed = () => planActivated && (selectedPlan.allowUnlimitedEvents || currentEventCount < eventLimit);
    const updateEventLimitInfo = () => {
        if (!eventLimitInfo) return;
        if (!planActivated) {
            eventLimitInfo.textContent = 'Plan not activated yet. Choose a plan to enable event creation.';
        } else if (selectedPlan.allowUnlimitedEvents) {
            eventLimitInfo.textContent = 'You can create unlimited events with your current plan.';
        } else {
            eventLimitInfo.textContent = `You have created ${currentEventCount} of ${eventLimit} allowed event${eventLimit === 1 ? '' : 's'}. Upgrade to Professional for unlimited event creation.`;
        }
        if (createButton) {
            const disabled = !isCreateAllowed();
            createButton.disabled = disabled;
            createButton.classList.toggle('opacity-50', disabled);
            createButton.classList.toggle('cursor-not-allowed', disabled);
        }
    };
    updateEventLimitInfo();

    function getFeatureDescription(feature) {
        if (/attendees/i.test(feature)) return 'Manage attendee limits and RSVP settings.';
        if (/event/i.test(feature)) return 'Create and manage events with ticketing options.';
        if (/analytics/i.test(feature)) return 'View sales and engagement charts.';
        if (/branding/i.test(feature)) return 'Customize your event pages with logos and colors.';
        if (/integrations/i.test(feature)) return 'Connect third-party tools and webhooks.';
        if (/Dedicated manager/i.test(feature)) return 'Contact your dedicated account manager for help.';
        if (/SLA/i.test(feature)) return 'Uptime and SLA guarantees for Enterprise customers.';
        if (/support/i.test(feature)) return 'Priority email support within business hours.';
        return 'Included feature.';
    }

    // Create event handler
    const createForm = document.getElementById('dashboardCreateEvent');
    if (createForm) {
        createForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!isCreateAllowed()) {
                showToast('You have reached your event creation limit for your current plan.', 'error');
                return;
            }

            const title = document.getElementById('dashEventTitle').value.trim();
            const date = document.getElementById('dashEventDate').value;
            const time = document.getElementById('dashEventTime').value;
            const location = document.getElementById('dashEventLocation').value.trim();
            const description = document.getElementById('dashEventDescription').value.trim();
            const ticketPrice = Number(document.getElementById('dashTicketPrice').value) || 0;

            if (!title) { showToast('Please provide a title'); return; }

            try {
                const resp = await fetch('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: 1, title, date, time, location, category: 'other', description, ticketPrice })
                });

                if (!resp.ok) throw new Error(await resp.text());

                const created = await resp.json();
                showToast('Event created');
                appendEventToList({ id: created.id || Date.now(), title, date, time, location, description, ticket_price: ticketPrice });
                createForm.reset();
            } catch (err) {
                showToast(err.message || 'Unable to create event', 'error');
            }
        });
    }

    const dashboardEvents = document.getElementById('dashboardEvents');
    function appendEventToList(ev) {
        if (!dashboardEvents) return;
        const div = document.createElement('div');
        div.className = 'p-3 bg-white/5 rounded flex items-center justify-between';
        div.innerHTML = `<div><div class="font-semibold">${escapeHtml(ev.title)}</div><div class="text-sm text-gray-300">${ev.date || ''} ${ev.time || ''} • ${escapeHtml(ev.location || '')}</div></div><div class="text-right text-sm text-gray-300">${ev.ticket_price ? '$'+Number(ev.ticket_price).toFixed(2) : 'Free'}</div>`;
        dashboardEvents.prepend(div);
        currentEventCount += 1;
        updateEventLimitInfo();
    }

    function renderPlanFeatureCards() {
        if (!planFeatureCards) return;
        planFeatureCards.innerHTML = '';

        const cards = [];
        if (!planActivated) {
            cards.push({
                title: 'Plan Locked',
                label: 'Choose a plan',
                description: 'Select a perfect plan from the pricing section to unlock your dashboard features and increase event capacity.',
                available: false
            });
        } else {
            cards.push({
                title: 'Event Limits',
                label: selectedPlan.allowUnlimitedEvents ? 'Unlimited events' : '1 event per month',
                description: selectedPlan.allowUnlimitedEvents ? 'Create as many events as you need.' : 'Starter users can create one event every month.',
                available: true
            });
            cards.push({
                title: 'Analytics',
                label: selectedPlan.analyticsLevel === 'advanced' ? 'Advanced reporting' : 'Basic reporting',
                description: selectedPlan.analyticsLevel === 'advanced' ? 'See detailed charts and trends.' : 'View simple event performance metrics.',
                available: true
            });
            cards.push({
                title: 'Custom Branding',
                label: selectedPlan.allowBranding ? 'Unlocked' : 'Locked',
                description: selectedPlan.allowBranding ? 'Upload your logo and brand your event pages.' : 'Available on Professional and Enterprise.',
                available: selectedPlan.allowBranding
            });
            cards.push({
                title: 'Integrations',
                label: selectedPlan.allowIntegrations ? 'Unlocked' : 'Locked',
                description: selectedPlan.allowIntegrations ? 'Connect external tools and webhooks.' : 'Available on Enterprise only.',
                available: selectedPlan.allowIntegrations
            });
            cards.push({
                title: 'Priority Support',
                label: selectedPlan.allowPrioritySupport ? 'Unlocked' : 'Standard',
                description: selectedPlan.allowPrioritySupport ? 'Get priority assistance when needed.' : 'Email support only for Starter users.',
                available: selectedPlan.allowPrioritySupport
            });
        }

        cards.forEach(card => {
            const div = document.createElement('div');
            div.className = `p-4 rounded bg-white/5 border ${card.available ? 'border-green-500/20' : 'border-yellow-400/20'}`;
            div.innerHTML = `
                <div class="flex items-center justify-between mb-3">
                    <div class="font-semibold">${card.title}</div>
                    <span class="text-sm ${card.available ? 'text-green-300' : 'text-yellow-300'}">${card.label}</span>
                </div>
                <div class="text-sm text-gray-300">${card.description}</div>
            `;
            planFeatureCards.appendChild(div);
        });
    }

renderPlanFeatureCards();

    // Load current events for this user (limited preview)
    (async function loadEvents() {
        try {
            const resp = await fetch('/api/events');
            if (!resp.ok) return;
            const list = await resp.json();
            currentEventCount = 0;
            (list || []).slice().reverse().forEach(ev => appendEventToList(ev));
        } catch (e) {
            // ignore
        }
    })();

    // quick action handlers
    // Analytics: render chart of events by category
    const analyticsCtx = document.getElementById('analyticsChart');
    let analyticsChart = null;
    async function renderAnalytics() {
        try {
            const resp = await fetch('/api/events');
            if (!resp.ok) return;
            const list = await resp.json();
            const counts = {};
            (list || []).forEach(ev => { const cat = (ev.category || ev.event_category || 'other').toLowerCase(); counts[cat] = (counts[cat] || 0) + 1; });
            const labels = Object.keys(counts);
            const data = labels.map(l => counts[l]);

            if (analyticsChart) {
                analyticsChart.data.labels = labels;
                analyticsChart.data.datasets[0].data = data;
                analyticsChart.update();
            } else if (analyticsCtx) {
                analyticsChart = new Chart(analyticsCtx.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels,
                        datasets: [{ label: 'Events by Category', data, backgroundColor: ['#a855f7','#ec4899','#f59e0b','#10b981','#3b82f6'] }]
                    },
                    options: { responsive: true, plugins: { legend: { display: false } } }
                });
            }
        } catch (e) {
            // ignore
        }
    }

    // Also prepare a monthly time-series for the past 6 months
    async function renderMonthlySeries() {
        try {
            const resp = await fetch('/api/events');
            if (!resp.ok) return;
            const list = await resp.json();

            const months = [];
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                months.push(d.toISOString().slice(0,7));
            }

            const monthCounts = months.map(m => 0);

            (list || []).forEach(ev => {
                const created = ev.created_at || ev.createdAt || ev.event_date || null;
                const dt = created ? new Date(created) : null;
                const key = dt && !isNaN(dt.getTime()) ? dt.toISOString().slice(0,7) : null;
                if (!key) return;
                const idx = months.indexOf(key);
                if (idx >= 0) monthCounts[idx]++;
            });

            // If analyticsChart exists, append a line dataset for monthly series
            if (analyticsChart) {
                const existing = analyticsChart.data.datasets.find(ds => ds.label === 'Events (monthly)');
                if (existing) {
                    existing.data = monthCounts;
                } else {
                    analyticsChart.data.labels = months.map(m => m.replace('-', '/'));
                    analyticsChart.data.datasets.push({ label: 'Events (monthly)', data: monthCounts, type: 'line', borderColor: '#ffffff', backgroundColor: 'rgba(255,255,255,0.08)', fill: true });
                }
                analyticsChart.update();
            } else {
                // Create a simple chart if none created
                if (analyticsCtx) {
                    analyticsChart = new Chart(analyticsCtx.getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: months.map(m => m.replace('-', '/')),
                            datasets: [{ label: 'Events (monthly)', data: monthCounts, backgroundColor: '#a855f7' }]
                        },
                        options: { responsive: true }
                    });
                }
            }
        } catch (e) {
            // ignore
        }
    }

    document.getElementById('openAnalytics')?.addEventListener('click', async () => {
        showToast('Updating analytics...');
        await renderAnalytics();
        showToast('Analytics updated');
    });

    const planNotice = document.getElementById('planNotice');
    if (planNotice && plan === 'starter') {
        planNotice.textContent = 'You are on Starter. Upgrade for unlimited events, integrations, and custom branding.';
        planNotice.classList.remove('hidden');
    }

    document.getElementById('openIntegrations')?.addEventListener('click', () => {
        if (!selectedPlan.allowIntegrations) {
            showToast('Custom integrations require Professional or Enterprise.', 'error');
            return;
        }
        const enabledSlack = localStorage.getItem('integration-slack') === '1';
        const enable = window.confirm(`${enabledSlack ? 'Disable' : 'Enable'} Slack integration?`);
        localStorage.setItem('integration-slack', enable ? '1' : '0');
        showToast(enable ? 'Slack enabled' : 'Slack disabled');
    });

    document.getElementById('upgradePlanBtn')?.addEventListener('click', () => {
        if (window.location.pathname.endsWith('dashboard.html')) {
            window.location.href = 'index.html#pricing';
        } else {
            window.scrollTo({ top: document.getElementById('pricing')?.offsetTop || 0, behavior: 'smooth' });
        }
    });

    const brandingUpload = document.getElementById('brandingUpload');
    const brandingPreview = document.getElementById('brandingPreview');

    document.getElementById('brandingBtn')?.addEventListener('click', () => {
        if (!selectedPlan.allowBranding) {
            showToast('Custom branding requires Professional or Enterprise.', 'error');
            return;
        }
        brandingUpload?.click();
    });

    if (brandingUpload) {
        brandingUpload.addEventListener('change', (ev) => {
            const file = ev.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result;
                localStorage.setItem('branding-image', dataUrl);
                if (brandingPreview) {
                    brandingPreview.src = dataUrl;
                    brandingPreview.classList.remove('hidden');
                }
                showToast('Branding uploaded (stored locally)');
                // Persist branding to server for logged-in user if possible
                try {
                    const storedUser = localStorage.getItem('eventflow-user');
                    const userId = storedUser ? (JSON.parse(storedUser).id || 1) : 1;
                    fetch('/api/branding', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId, image: dataUrl })
                    }).catch(() => {});
                } catch (e) { /* ignore */ }
            };
            reader.readAsDataURL(file);
        });
    }

    // restore branding preview if present
    const savedBranding = localStorage.getItem('branding-image');
    if (savedBranding && brandingPreview) {
        brandingPreview.src = savedBranding;
        brandingPreview.classList.remove('hidden');
    }

    document.getElementById('signOutBtn')?.addEventListener('click', async () => {
        try {
            // server-side logout best-effort
            await window.authApi?.logout?.();
        } catch (e) {
            // ignore
        }
        localStorage.removeItem('trialPlan');
        localStorage.removeItem('pendingPlan');
        localStorage.removeItem('eventflow-user');
        localStorage.removeItem('eventflow-session-token');
    });

    // helper utilities
    function escapeHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

});
