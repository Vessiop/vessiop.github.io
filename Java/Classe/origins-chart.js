document.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector('[data-origins-section]');
    const source = window.Chart?.getChart('statsChart');
    if (!section || !source) return;

    const sourceCard = source.canvas.closest('.chart-container');
    if (!sourceCard) return;

    const sourceFrame = source.canvas.parentElement;
    const { clone } = Chart.helpers;

    const layout = document.createElement('div');
    layout.className = 'origins-layout';
    const panel = document.createElement('aside');
    panel.className = 'origins-chart';

    const card = sourceCard.cloneNode(false);
    const title = sourceCard.firstElementChild.cloneNode(true);
    const frame = sourceFrame.cloneNode(false);
    for (const decoration of sourceFrame.querySelectorAll(':scope > [aria-hidden="true"]')) {
        frame.append(decoration.cloneNode(true));
    }
    const canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', source.canvas.getAttribute('aria-label') || title.textContent.trim());
    frame.append(canvas);
    card.append(title, frame);
    panel.append(card);

    const continuation = section.nextElementSibling;
    section.before(layout);
    layout.append(section);
    if (continuation?.hasAttribute('data-origins-continuation')) layout.append(continuation);
    layout.append(panel);

    const nav = document.querySelector('.tv-nav, .class-nav');
    const positionChart = () => {
        const margin = document.documentElement.clientWidth - layout.getBoundingClientRect().right;
        const available = margin - 32;
        const hasRoom = available >= 220;
        layout.classList.toggle('origins-layout--sidebar', hasRoom);
        if (hasRoom) layout.style.setProperty('--origins-rail-width', `${Math.min(320, available)}px`);
        else layout.style.setProperty('--origins-dock-overhang', `${Math.max(0, margin - 16)}px`);
        if (nav) layout.style.setProperty('--origins-nav-height', `${nav.offsetHeight}px`);
    };
    positionChart();
    const resize = new ResizeObserver(positionChart);
    resize.observe(layout);
    if (nav) resize.observe(nav);
    window.addEventListener('resize', positionChart);

    const options = clone(source.config.options);
    options.responsive = true;
    options.maintainAspectRatio = false;
    options.animation = false;
    const { pointLabels, ticks } = options.scales.r;
    const pointFont = pointLabels.font || {};
    const tickFont = ticks.font || {};
    pointLabels.font = ({ chart }) => ({
        ...pointFont,
        size: Math.min(pointFont.size || 12, chart.height < 160 ? 10 : 12)
    });
    ticks.font = ({ chart }) => ({
        ...tickFont,
        size: Math.min(tickFont.size || 10, chart.height < 190 ? 8 : 10)
    });

    const preview = new Chart(canvas, {
        type: source.config.type,
        data: clone(source.data),
        options
    });
    Chart.register({
        id: 'origins-chart-sync',
        afterUpdate(chart) {
            if (chart !== source) return;
            preview.data = clone(chart.data);
            preview.update('none');
        }
    });
}, { once: true });
