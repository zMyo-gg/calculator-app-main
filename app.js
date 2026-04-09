document.addEventListener('DOMContentLoaded', () => {

    // CAMBIO DE TEMA

    const body = document.body;
    const themeTrack = document.querySelector('.theme-switcher__track');
    const themeNumbers = document.querySelectorAll('.theme-switcher__numbers button');
    
    // Función 
    const setTheme = (themeNum) => {
        body.setAttribute('data-theme', themeNum);
        // Opcional: guardar en localStorage para mantener el tema si recarga
        localStorage.setItem('calculatorTheme', themeNum);
    };

    // área del switch
    themeTrack.addEventListener('click', (e) => {
        //  tema actual
        let currentTheme = parseInt(body.getAttribute('data-theme'));
        // Pasamos al siguiente (1 -> 2 -> 3 -> 1)
        let nextTheme = currentTheme === 3 ? 1 : currentTheme + 1;
        setTheme(nextTheme);
    });

    // Al hacer clic en los números de arriba (1, 2, 3)
    themeNumbers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const themeSelected = e.target.getAttribute('data-theme');
            setTheme(themeSelected);
        });
    });

    // Cargar tema 
    const savedTheme = localStorage.getItem('calculatorTheme');
    if (savedTheme) {
        setTheme(savedTheme);
    }

    // ==========================================
    // LÓGICA DE LA CALCULADORA
    // ==========================================
    const display = document.getElementById('display');
    const keys = document.querySelectorAll('.key');

    let currentInput = '0';
    let previousInput = '';
    let currentOperator = null;
    let shouldResetScreen = false;

    // Función para dar formato a los números con comas (ej. 399,981)
    const formatNumber = (numStr) => {
        if (numStr === '-' || numStr === '') return numStr;
        
        const parts = numStr.split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1];
        
        let formattedInteger = parseFloat(integerPart.replace(/,/g, '')).toLocaleString('en-US');
        
        // Si el usuario solo escribió "0" al inicio o un signo negativo
        if (integerPart === '0') formattedInteger = '0';
        if (integerPart === '-0') formattedInteger = '-0';

        if (decimalPart !== undefined) {
            return `${formattedInteger}.${decimalPart}`;
        }
        return formattedInteger;
    };

    const updateDisplay = () => {
        display.textContent = formatNumber(currentInput);
    };

    const handleNumber = (numberStr) => {
        if (currentInput === '0' || shouldResetScreen) {
            currentInput = numberStr;
            shouldResetScreen = false;
        } else {
            // Limitar longitud para evitar desbordes visuales extremos
            if (currentInput.replace(/,/g, '').length < 15) {
                currentInput += numberStr;
            }
        }
        updateDisplay();
    };

    const handleDecimal = () => {
        if (shouldResetScreen) {
            currentInput = '0.';
            shouldResetScreen = false;
            updateDisplay();
            return;
        }
        
        if (!currentInput.includes('.')) {
            currentInput += '.';
            updateDisplay();
        }
    };

    const handleDelete = () => {
        if (shouldResetScreen) return;
        
        if (currentInput.length === 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) {
            currentInput = '0';
        } else {
            currentInput = currentInput.slice(0, -1);
        }
        updateDisplay();
    };

    const handleReset = () => {
        currentInput = '0';
        previousInput = '';
        currentOperator = null;
        shouldResetScreen = false;
        updateDisplay();
    };

    const calculate = () => {
        if (currentOperator === null || previousInput === '') return;

        let result = 0;
        // Quitar comas para hacer los cálculos matemáticos
        const prev = parseFloat(previousInput.replace(/,/g, ''));
        const current = parseFloat(currentInput.replace(/,/g, ''));

        if (isNaN(prev) || isNaN(current)) return;

        switch (currentOperator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    currentInput = 'Error';
                    previousInput = '';
                    currentOperator = null;
                    display.textContent = currentInput;
                    shouldResetScreen = true;
                    return;
                }
                result = prev / current;
                break;
        }

        // Redondear para evitar problemas de coma flotante en JS (ej. 0.1 + 0.2)
        result = Math.round(result * 100000000) / 100000000;
        
        currentInput = result.toString();
        currentOperator = null;
        previousInput = '';
        shouldResetScreen = true;
        updateDisplay();
    };

    const handleOperator = (operator) => {
        // Si ya hay un operador y el usuario presiona otro sin haber metido un nuevo número, actualizamos el operador
        if (currentOperator !== null && shouldResetScreen) {
            currentOperator = operator;
            return;
        }

        if (previousInput !== '' && currentOperator !== null) {
            calculate();
        }

        currentOperator = operator;
        previousInput = currentInput;
        shouldResetScreen = true;
    };

    // Añadir eventos a todos los botones del teclado
    keys.forEach(key => {
        key.addEventListener('click', () => {
            // Revisamos qué tipo de tecla se presionó
            if (key.hasAttribute('data-value')) {
                const value = key.getAttribute('data-value');
                if (value === '.') {
                    handleDecimal();
                } else {
                    handleNumber(value);
                }
            } else if (key.hasAttribute('data-action')) {
                const action = key.getAttribute('data-action');
                if (action === 'delete') handleDelete();
                if (action === 'reset') handleReset();
                if (action === 'equal') calculate();
            } else if (key.hasAttribute('data-operator')) {
                const operator = key.getAttribute('data-operator');
                handleOperator(operator);
            }
        });
    });

    // Soporte para teclado de computadora
    document.addEventListener('keydown', (e) => {
        if (e.key >= '0' && e.key <= '9') handleNumber(e.key);
        if (e.key === '.') handleDecimal();
        if (e.key === 'Backspace') handleDelete();
        if (e.key === 'Escape') handleReset();
        if (e.key === '=' || e.key === 'Enter') {
            e.preventDefault();
            calculate();
        }
        if (['+', '-', '*', '/'].includes(e.key)) {
            handleOperator(e.key);
        }
    });
});
