<script setup>
    //------ imports ------
    import { ref } from 'vue';

    //------- data -------
    const FirstName = ref('');
    const LastName = ref('');
    const dateOfBirth = ref('');
    const PhoneNumber = ref('');
    const Email = ref('');
    const Adress = ref('');
    const Password = ref('');
    
    const statusMessage = ref('');
    const statusType = ref(''); 
    const isSubmitting = ref(false);

    

    //------ settings ------
    const API_URL = 'http://localhost:3000/users'; 

    //------ methods ------
    const handleRegister = async () => {
        statusMessage.value = '';
        isSubmitting.value = true;

        if (
            !FirstName.value.trim() || 
            !LastName.value.trim() || 
            !dateOfBirth.value || 
            !PhoneNumber.value.trim() || 
            !Email.value.trim() || 
            !Password.value
        ) {
            statusMessage.value = 'Vul alle verplichte velden in.';
            statusType.value = 'error';
            isSubmitting.value = false;
            return;
        }

        // De regex /^\d+$/ start einde getallen
        if (!/^\d+$/.test(PhoneNumber.value.trim())) {
            statusMessage.value = 'Telefoonnummer mag alleen uit cijfers bestaan (geen streepjes of spaties).';
            statusType.value = 'error';
            isSubmitting.value = false;
            return;
        }

        // verzamel data
        const registrationData = {
            FirstName: FirstName.value.trim(),
            LastName: LastName.value.trim(),
            DateOfBirth: dateOfBirth.value,
            PhoneNumber: PhoneNumber.value.trim(),
            Email: Email.value.trim(),
            Address: Adress.value.trim(), 
            PasswordHash: Password.value,
        };
        
        console.log('Versturen naar:', API_URL);

        try {
            const response = await fetch(API_URL, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registrationData)
            });

            const result = await response.json();

            if (response.ok && !result.status) {
                console.log('Registratie succesvol!', result);
                statusMessage.value = 'Account succesvol aangemaakt!';
                statusType.value = 'success';
                window.location.href = '/login';
            } else {
                console.error('Registratie fout:', result);
                statusMessage.value = 'Fout: ' + (result.status || 'Onbekende fout bij de server');
                statusType.value = 'error';
            }
        } catch (error) {
            console.error('Netwerkfout:', error);
            statusMessage.value = 'Kan geen verbinding maken met de server.';
            statusType.value = 'error';
        } finally {
            isSubmitting.value = false;
        }
    };
</script>

<template>
    <div class="register-container">
        <h1>Account Aanmaken</h1>
        
        <div class="section">
            <h3>Persoonlijke gegevens</h3>

            <div class="form-row">
                <div class="field half">
                    <label>Voornaam *</label>
                    <input v-model="FirstName" type="text" placeholder="Jan" required>
                </div>
                <div class="field half">
                    <label>Achternaam *</label>
                    <input v-model="LastName" type="text" placeholder="Jansen" required>
                </div>
            </div>

            <div class="field">
                <label>Geboortedatum *</label>
                <input v-model="dateOfBirth" type="date" required>
            </div>

            <div class="field">
                <label>Telefoonnummer *</label> 
                <input v-model="PhoneNumber" type="tel" placeholder="0612345678" required>
            </div>

            <div class="field">
                <label>E-mail *</label>
                <input v-model="Email" type="email" placeholder="jan@example.com" required>
            </div>
            
            <div class="field">
                <label>Adres</label>
                <input v-model="Adress" type="text" placeholder="Straatnaam 1, Stad">
            </div>

            <div class="field">
                <label>Wachtwoord *</label>
                <input v-model="Password" type="password" placeholder="Kies een veilig wachtwoord" required>
            </div>
        </div>
        
        <!-- Error/Success Message Box -->
        <div v-if="statusMessage" :class="['message-box', statusType]">
            {{ statusMessage }}
        </div>

        <button class="save-btn" @click="handleRegister" :disabled="isSubmitting">
            {{ isSubmitting ? 'Bezig met opslaan...' : 'Registreren' }}
        </button>
        
        <p class="login-link">
            Al een account? <RouterLink to="/login">Log hier in</RouterLink>
        </p>
    </div>
</template>

<style scoped>
    .register-container {
        max-width: 500px;
        margin: 40px auto;
        padding: 40px;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        background-color: white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    h1 {
        text-align: center;
        color: #2d3748;
        margin-bottom: 30px;
        font-size: 1.8rem;
    }

    h3 {
        color: #718096;
        font-size: 1rem;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 10px;
        margin-bottom: 20px;
    }

    .section {
        margin-bottom: 20px;
    }

    .form-row {
        display: flex;
        gap: 15px;
    }

    .field {
        margin-bottom: 20px;
    }

    .field.half {
        flex: 1;
    }

    label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #4a5568;
        font-size: 0.95rem;
    }

    input {
        width: 100%;
        padding: 12px;
        box-sizing: border-box;
        border: 1px solid #cbd5e0;
        border-radius: 6px;
        font-size: 1rem;
        transition: border-color 0.2s, box-shadow 0.2s;
    }

    input:focus {
        outline: none;
        border-color: #4299e1;
        box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
    }

    .save-btn {
        width: 100%;
        padding: 14px;
        background-color: #3182ce;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
        font-weight: bold;
        transition: background-color 0.2s;
        margin-top: 10px;
    }

    .save-btn:hover {
        background-color: #2b6cb0;
    }

    .save-btn:disabled {
        background-color: #a0aec0;
        cursor: not-allowed;
    }

    .message-box {
        padding: 15px;
        margin-bottom: 20px;
        border-radius: 6px;
        text-align: center;
        font-size: 0.95rem;
    }

    .message-box.success {
        background-color: #c6f6d5;
        color: #22543d;
        border: 1px solid #9ae6b4;
    }

    .message-box.error {
        background-color: #fed7d7;
        color: #822727;
        border: 1px solid #feb2b2;
    }

    .login-link {
        text-align: center;
        margin-top: 25px;
        color: #718096;
        font-size: 0.9rem;
    }

    .login-link a {
        color: #3182ce;
        text-decoration: none;
        font-weight: 600;
    }

    .login-link a:hover {
        text-decoration: underline;
    }
</style>