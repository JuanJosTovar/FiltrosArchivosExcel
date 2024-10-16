document.addEventListener('DOMContentLoaded', function () {
    let excelData = [];
    let manifiestosCargados = [];
    let excelCargado = null;
    const tableHeader = document.getElementById('tableHeader');
    const tableBody = document.getElementById('tableBody');

    const proveedorSelect = document.getElementById('proveedor');
    const internalReferenceInput = document.getElementById('internalReference');
    const billInput = document.getElementById('bill');
    
    const clearProveedor = document.getElementById('clearProveedor');
    const clearInternalReference = document.getElementById('clearInternalReference');
    const clearBill = document.getElementById('clearBill');

    const columnOrder = ['# Factura', 'Manifiestos', 'Orden de pedido', 'Proveedores', 'REFERENCIA INTERNA', 'Ref de proveedores'];


    document.getElementById('inputFile').addEventListener('change', handleFile);

    function handleFile(e) {
        showSpinner();
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function (event) {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            excelData = XLSX.utils.sheet_to_json(firstSheet);
            renderTable(excelData);
            hideSpinner();
        };

        reader.readAsArrayBuffer(file);
    }

    document.getElementById('filterForm').addEventListener('submit', function (e) {
        e.preventDefault();
        showSpinner();

        const proveedor = proveedorSelect.value.toLowerCase();
        const internalReference = internalReferenceInput.value.toLowerCase();
        const bill = billInput.value.toLowerCase();

        const filteredData = excelData.filter(row => {
            return (
                (!proveedor || (row['Proveedores '] && row['Proveedores '].toLowerCase().includes(proveedor))) &&
                (!internalReference || (row['REFERENCIA INTERNA'] && row['REFERENCIA INTERNA'].toLowerCase().includes(internalReference))) &&
                (!bill || (row['# Factura '] && String(row['# Factura ']).toLowerCase().includes(bill)))
            );
        });

        renderTable(filteredData);
        hideSpinner();
    });

    function renderTable(data) {
        tableHeader.innerHTML = '';
        tableBody.innerHTML = '';

        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6">No se encontraron datos relacionados a la búsqueda</td></tr>';
            return;
        }

        columnOrder.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column; 
            tableHeader.appendChild(th);
        });

        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row['# Factura '] || 'Sin factura'}</td>
                <td>${row.Manifiestos || 'No se encuentra'}
                ${row.Manifiestos ? `
                    <svg id="manifiesto-${row['Manifiestos']}" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-up-right-square" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M15 2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1zM0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm5.854 8.803a.5.5 0 1 1-.708-.707L9.243 6H6.475a.5.5 0 1 1 0-1h3.975a.5.5 0 0 1 .5.5v3.975a.5.5 0 1 1-1 0V6.707z"/>
                    </svg>
                ` : ''}</td>
                <td>${row['Orden de pedido'] || 'Sin orden'}</td>
                <td>${row['Proveedores '] || 'Sin proveedor'}</td>
                <td>${row['REFERENCIA INTERNA'] || 'Sin referencia interna'}</td>
                <td>${row['Ref de proveedores'] || 'Sin referencia de proveedor'}</td>
            `;
            tableBody.appendChild(tr);
        });
        assignSvgClickEvents();
    }

    function assignSvgClickEvents() {
        showSpinner();
        document.querySelectorAll('svg[id^="manifiesto-"]').forEach(svg => {
            svg.addEventListener('click', function () {
                const manifiestoId = this.id.replace('manifiesto-', ''); 
                console.log(`Clic en manifiesto: ${manifiestoId}`);
                
                
                const archivoEncontrado = manifiestosCargados.find(file => file.name.includes(manifiestoId));

                if (archivoEncontrado) {
                    const url = URL.createObjectURL(archivoEncontrado); 
                    window.open(url, '_blank');
                    hideSpinner();
                } else {
                    hideSpinner();
                    alert(`Manifiesto ${manifiestoId} no encontrado entre los archivos cargados.`);
                }
            });
        });
    }

    function toggleClearButton(inputElement, clearButton) {
        if (inputElement.value) {
            clearButton.style.display = 'block';
        } else {
            clearButton.style.display = 'none';
        }
    }

    internalReferenceInput.addEventListener('input', function () {
        toggleClearButton(internalReferenceInput, clearInternalReference);
    });

    billInput.addEventListener('input', function () {
        toggleClearButton(billInput, clearBill);
    });

    proveedorSelect.addEventListener('change', function () {
        toggleClearButton(proveedorSelect, clearProveedor);
    });

    function clearField(inputElement, clearButton) {
        inputElement.value = '';
        clearButton.style.display = 'none';
    }

    clearInternalReference.addEventListener('click', function () {
        clearField(internalReferenceInput, clearInternalReference);
    });

    clearBill.addEventListener('click', function () {
        clearField(billInput, clearBill);
    });

    clearProveedor.addEventListener('click', function () {
        clearField(proveedorSelect, clearProveedor);
        proveedorSelect.selectedIndex = 0;
    });


    document.getElementById('inputFile').addEventListener('change', function () {
        const fileName = this.files.length > 0 ? this.files[0].name : 'No se ha seleccionado ningún archivo';
        document.getElementById('file-name').textContent = fileName;
    });

    document.getElementById('manifiestosInput').addEventListener('change', function (event) {
        manifiestosCargados = Array.from(event.target.files);
    });

    document.getElementById('openModal').addEventListener('click', function () {
        document.getElementById('fileModal').style.display = 'flex'; 
    });

    document.getElementById('closeModal').addEventListener('click', function () {
        document.getElementById('fileModal').style.display = 'none'; 
    });

    document.getElementById('acceptFiles').addEventListener('click', function () {
        showSpinner();
        manifiestosCargados = Array.from(document.getElementById('manifiestosInput').files);
        excelCargado = document.getElementById('inputFile').files[0];

        document.getElementById('fileModal').style.display = 'none';

        console.log('PDFs cargados:', manifiestosCargados);
        console.log('Excel cargado:', excelCargado);
        hideSpinner();
    });

    function showSpinner() {
        document.getElementById('loading').style.display = 'flex'; // Muestra el spinner
    }
    
    function hideSpinner() {
        document.getElementById('loading').style.display = 'none'; // Oculta el spinner
    }
});
