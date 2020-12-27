<template>
	<div id="app">
		<Header />
		<div id="navbar">
			<router-link to="/"><button class="button">Home</button></router-link>
			<router-link to="/about"><button class="button">Customer Portal</button></router-link>
			<router-link to="/about"><button class="button">Employee Portal</button></router-link>
			<router-link to="/about"><button class="button">Login</button></router-link>
		</div>
		<router-view />
	</div>
</template>

<script lang="ts">
import Header from '@/components/Header.vue';
export default {
	name: 'app',
	components: { Header },
};
</script>

<style>
body {
	background: rgb(241, 241, 241);
	font-family: Arial, Helvetica, sans-serif;
	font-size: 16;
	line-height: 1.6em;
	margin: 0;
}

.container {
	width: 80%;
	margin: auto;
	overflow: hidden;
	text-align: center;
}
.button {
	height: 30px;
	width: 250px;
	background-color: white;
	color: black;
	border: 2px solid rgb(32, 178, 170);
	transition-duration: 0.4s;
	margin: 5px;
	padding: 3px;
}
.button:hover {
	background-color: rgb(32, 178, 170);
	color: white;
	box-shadow: 0 12px 16px 0 rgba(0, 0, 0, 0.24), 0 17px 50px 0 rgba(0, 0, 0, 0.19);
}

#navbar {
	position: sticky;
	top: 9%;
	background-color: rgb(255, 165, 0);
	text-align: center;
	padding: 7px;
}
#navbar a {
	color: rgb(19, 19, 102);
	text-decoration: none;
}

@media (max-width: 600px) {
	#about {
		width: 100%;
		float: none;
	}
	#sidebar {
		width: 100%;
		float: none;
	}
}
</style>
