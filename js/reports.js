// Consultas de Ganancias - RF5
const ReportsManager = {
    sales: [],
    monthlySalesChart: null,
    productProfitChart: null,

    init: function() {
        this.loadSales();
    },

    loadSales: function() {
        this.sales = StorageManager.readAll('sales') || [];
        return this.sales;
    },

    // RF5a: Ganancias mensuales por año
    generateMonthlyReport: function(year) {
        const selectedYear = year || Utils.getCurrentYear();
        
        const monthlySales = Array(12).fill(0).map((_, index) => ({
            month: index + 1,
            monthName: Utils.getMonthName(index + 1),
            profit: 0,
            sales: 0,
            revenue: 0
        }));

        this.sales.forEach(sale => {
            const saleDate = new Date(sale.date);
            const saleYear = saleDate.getFullYear();
            const saleMonth = saleDate.getMonth();

            if (saleYear === parseInt(selectedYear)) {
                monthlySales[saleMonth].profit += sale.profit;
                monthlySales[saleMonth].sales += sale.quantity;
                monthlySales[saleMonth].revenue += sale.subtotal;
            }
        });

        return monthlySales;
    },

    renderMonthlyReportTable: function(year) {
        const tbody = document.getElementById('monthlyReportTableBody');
        if (!tbody) return;

        const monthlyData = this.generateMonthlyReport(year);
        
        tbody.innerHTML = monthlyData.map(month => `
            <tr>
                <td>${month.monthName}</td>
                <td class="text-end">${month.sales}</td>
                <td class="text-end">${Utils.formatPrice(month.revenue)}</td>
                <td class="text-end text-success"><strong>${Utils.formatPrice(month.profit)}</strong></td>
            </tr>
        `).join('');

        const totalProfit = monthlyData.reduce((sum, m) => sum + m.profit, 0);
        const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
        const totalSales = monthlyData.reduce((sum, m) => sum + m.sales, 0);

        tbody.innerHTML += `
            <tr class="table-dark fw-bold">
                <td>TOTAL</td>
                <td class="text-end">${totalSales}</td>
                <td class="text-end">${Utils.formatPrice(totalRevenue)}</td>
                <td class="text-end text-success">${Utils.formatPrice(totalProfit)}</td>
            </tr>
        `;
    },

    renderMonthlyChart: function(year) {
        const canvas = document.getElementById('monthlyProfitChart');
        if (!canvas) return;

        const monthlyData = this.generateMonthlyReport(year);
        
        if (this.monthlySalesChart) {
            this.monthlySalesChart.destroy();
        }

        const ctx = canvas.getContext('2d');
        this.monthlySalesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyData.map(m => m.monthName),
                datasets: [{
                    label: 'Ganancias Mensuales',
                    data: monthlyData.map(m => m.profit),
                    backgroundColor: Utils.generateChartColors(12),
                    borderColor: '#28a745',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return Utils.formatPrice(value);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Ganancia: ' + Utils.formatPrice(context.parsed.y);
                            }
                        }
                    }
                }
            }
        });
    },

    // RF5b: Ganancias por producto específico
    generateProductReport: function(productId) {
        const productSales = this.sales.filter(sale => sale.productId === parseInt(productId));
        
        const totalProfit = productSales.reduce((sum, sale) => sum + sale.profit, 0);
        const totalRevenue = productSales.reduce((sum, sale) => sum + sale.subtotal, 0);
        const totalQuantity = productSales.reduce((sum, sale) => sum + sale.quantity, 0);
        const totalCost = productSales.reduce((sum, sale) => sum + (sale.cost * sale.quantity), 0);

        return {
            productId,
            sales: productSales,
            totalProfit,
            totalRevenue,
            totalQuantity,
            totalCost
        };
    },

    renderProductReportTable: function(productId) {
        const tbody = document.getElementById('productReportTableBody');
        if (!tbody) return;

        const reportData = this.generateProductReport(productId);
        
        if (reportData.sales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay ventas para este producto</td></tr>';
            return;
        }

        tbody.innerHTML = reportData.sales.map(sale => `
            <tr>
                <td>${Utils.formatDate(sale.date)}</td>
                <td class="text-end">${sale.quantity}</td>
                <td class="text-end">${Utils.formatPrice(sale.cost * sale.quantity)}</td>
                <td class="text-end">${Utils.formatPrice(sale.subtotal)}</td>
                <td class="text-end text-success"><strong>${Utils.formatPrice(sale.profit)}</strong></td>
            </tr>
        `).join('');

        tbody.innerHTML += `
            <tr class="table-dark fw-bold">
                <td>TOTAL</td>
                <td class="text-end">${reportData.totalQuantity}</td>
                <td class="text-end">${Utils.formatPrice(reportData.totalCost)}</td>
                <td class="text-end">${Utils.formatPrice(reportData.totalRevenue)}</td>
                <td class="text-end text-success">${Utils.formatPrice(reportData.totalProfit)}</td>
            </tr>
        `;
    },

    renderProductChart: function(productId) {
        const canvas = document.getElementById('productProfitChart');
        if (!canvas) return;

        const reportData = this.generateProductReport(productId);
        
        if (this.productProfitChart) {
            this.productProfitChart.destroy();
        }

        if (reportData.sales.length === 0) {
            canvas.style.display = 'none';
            return;
        }

        canvas.style.display = 'block';
        const ctx = canvas.getContext('2d');
        
        this.productProfitChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: reportData.sales.map(sale => Utils.formatDate(sale.date)),
                datasets: [{
                    label: 'Ganancia por Venta',
                    data: reportData.sales.map(sale => sale.profit),
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return Utils.formatPrice(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Ganancia: ' + Utils.formatPrice(context.parsed.y);
                            }
                        }
                    }
                }
            }
        });
    },

    loadProductsSelect: function(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;

        const products = StorageManager.readAll('products');
        select.innerHTML = '<option value="">Seleccione un producto</option>' +
            products.map(p => `<option value="${p.id}">${Utils.sanitizeHTML(p.name)}</option>`).join('');
    },

    exportMonthlyReport: function(year) {
        const monthlyData = this.generateMonthlyReport(year);
        const exportData = monthlyData.map(month => ({
            Mes: month.monthName,
            'Ventas': month.sales,
            'Ingresos': month.revenue,
            'Ganancias': month.profit
        }));

        Utils.exportToCSV(exportData, `reporte_mensual_${year}.csv`);
        Utils.showToast('Reporte exportado exitosamente', 'success');
    },

    exportProductReport: function(productId) {
        const reportData = this.generateProductReport(productId);
        const product = StorageManager.readById('products', productId);
        
        const exportData = reportData.sales.map(sale => ({
            Fecha: sale.date,
            Cantidad: sale.quantity,
            Costo: sale.cost * sale.quantity,
            'Ingresos': sale.subtotal,
            'Ganancia': sale.profit
        }));

        Utils.exportToCSV(exportData, `reporte_producto_${product.name}_${Date.now()}.csv`);
        Utils.showToast('Reporte exportado exitosamente', 'success');
    }
};
