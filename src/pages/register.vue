<!--
    settings van de pagina
-->

<script setup>
    //------ imports ------
    import { ref } from 'vue';

    //------ lifecycles ------

    //------- data -------
        // basic personal info
        const FirstName = ref('');
        const LastName = ref('');
        const dateOfBirth = ref('');
        const PhoneNumber = ref('');
        const Email = ref('');
        const Adress = ref('');
        const Password = ref('');

    //------ methods ------
    const handleRegister = async () => {
        // verzamel data
        const registrationData = {
            FirstName: FirstName.value,
            LastName: LastName.value,
            DateOfBirth: dateOfBirth.value,
            PhoneNumber: PhoneNumber.value,
            Email: Email.value,
            Address: Adress.value,
            PasswordHash: Password.value,
        };
        console.log('Registratiegegevens:', registrationData);

        // data naar database sturen
        const response = await fetch('http://localhost:3000/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registrationData)
        });

        const result = await response.json();

        if (response.ok) {
            console.log('Registratie succesvol!');
        } else {
            console.error('Registratie mislukt.');
        }


    };

</script>


<template>
    <div class="register-container">
        <h1>Register Page</h1>
        
        <div class="section">
            <h3>Persoonlijke gegevens</h3>

            <div class="field">
                <label>Voornaam</label>
                <input v-model="FirstName" type="text" placeholder="Jan" required>
            </div>

            <div class="field">
                <label>Achternaam</label>
                <input v-model="LastName" type="text" placeholder="Jansen" required>
            </div>

            <div class="field">
                <label>Geboortedatum</label>
                <input v-model="dateOfBirth" type="date" required>
            </div>
            
            <div class="field">
                <label>Telefoonnummer</label>
                <input v-model="PhoneNumber" type="text" placeholder="06 12345678" required>
            </div>

            <div class="field">
                <label>E-mail</label>
                <input v-model="Email" type="email" placeholder="jan@example.com" required>
            </div>

            <div class="field">
                <label>Adres</label>
                <input v-model="Adress" type="text" placeholder="Straatnaam 1">
            </div>

            <div class="field">
                <label>Wachtwoord</label>
                <input v-model="Password" type="password" required>
            </div>

            
        </div>


        <button class="save-btn" @click="handleRegister">Account Opslaan</button>
    </div>
</template>

<style scoped>
    .register-container {
        max-width: 600px;
        margin: auto;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 8px;
        background-color: #f9f9f9;
    }
    .section {
        margin-bottom: 20px;
    }
    .field {
        margin-bottom: 15px;
    }
    label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
    }
    input[type="text"],
    input[type="email"],
    input[type="password"],
    input[type="number"] {
        width: 100%;
        padding: 8px;
        box-sizing: border-box;
    }
    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 15px;
    }
    .save-btn {
        padding: 10px 20px;
        background-color: #28a745;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    .save-btn:hover {
        background-color: #218838;
    }
</style>