// app/controllers/AuthController.js
window.TorteriaApp = window.TorteriaApp || {};
window.TorteriaApp.Controllers = window.TorteriaApp.Controllers || {};

window.TorteriaApp.Controllers.AuthController = (function() {
  
  const initLogin = () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const emailInput = loginForm.querySelector('input[type="email"]');
      const passInput = loginForm.querySelector('input[type="password"]');
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      if (!emailInput || !passInput) return;

      const email = emailInput.value.trim();
      const password = passInput.value.trim();

      // Deshabilitar botón mientras carga
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Ingresando...';
      submitBtn.disabled = true;

      try {
        const response = await window.TorteriaApp.Services.api.login(email, password);
        if (response.success) {
          // Guardar usuario en localStorage o sessionStorage si se desea
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Mostrar mensaje de éxito y redirigir según el rol
          alert("¡Bienvenido, " + response.user.name + "!");
          if (response.user.role === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'index.html';
          }
        }
      } catch (error) {
        alert("Error al iniciar sesión: " + error.message);
      } finally {
        submitBtn.innerHTML = originalBtnHtml;
        submitBtn.disabled = false;
      }
    });
  };

  const initRegister = () => {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const firstNameInput = registerForm.querySelector('#regFirstName');
      const lastNameInput = registerForm.querySelector('#regLastName');
      const emailInput = registerForm.querySelector('input[type="email"]');
      const passInput = registerForm.querySelector('#regPassword');
      const confirmPassInput = registerForm.querySelectorAll('input[type="password"]')[1];
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      if (passInput.value !== confirmPassInput.value) {
        alert("Las contraseñas no coinciden.");
        return;
      }

      const userData = {
        name: `${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`,
        email: emailInput.value.trim(),
        password: passInput.value.trim()
      };

      // Deshabilitar botón
      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registrando...';
      submitBtn.disabled = true;

      try {
        const response = await window.TorteriaApp.Services.api.register(userData);
        if (response.success) {
          alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
          // Cambiar a la pestaña de login
          const switchBtn = registerForm.querySelector('.switch-btn');
          if(switchBtn) switchBtn.click();
          else window.location.reload();
        }
      } catch (error) {
        alert("Error al registrar: " + error.message);
      } finally {
        submitBtn.innerHTML = originalBtnHtml;
        submitBtn.disabled = false;
      }
    });
  };

  const initFormSwitching = () => {
    const switchBtns = document.querySelectorAll('.switch-btn');
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');

    switchBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        if (target === 'register') {
          loginForm.classList.remove('active');
          registerForm.classList.add('active');
        } else {
          registerForm.classList.remove('active');
          loginForm.classList.add('active');
        }
      });
    });
  };

  const initPasswordToggles = () => {
    const toggleBtns = document.querySelectorAll('.password-toggle');
    toggleBtns.forEach(btn => {
      // Make it visually clickable with cursor style
      btn.style.cursor = 'pointer';
      
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        // Search for the input within the same parent container
        const container = this.parentElement;
        const input = container.querySelector('input');
        const icon = this.querySelector('i');
        
        if (input) {
          if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
          } else {
            input.type = 'password';
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
          }
        }
      });
    });
  };

  return {
    init: function() {
      if (typeof window.TorteriaApp.Views.CommonView !== 'undefined') {
        window.TorteriaApp.Views.CommonView.init();
      }
      initFormSwitching();
      initLogin();
      initRegister();
      initPasswordToggles();
    }
  };
})();
