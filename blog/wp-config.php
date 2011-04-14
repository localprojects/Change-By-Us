<?php
/**
 * The base configurations of the WordPress.
 *
 * This file has the following configurations: MySQL settings, Table Prefix,
 * Secret Keys, WordPress Language, and ABSPATH. You can find more information
 * by visiting {@link http://codex.wordpress.org/Editing_wp-config.php Editing
 * wp-config.php} Codex page. You can get the MySQL settings from your web host.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'wordpress');

/** MySQL database username */
define('DB_USER', 'root');

/** MySQL database password */
define('DB_PASSWORD', 'root');

/** MySQL hostname */
define('DB_HOST', 'localhost');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'Lp$>]dIH(!L4@Y+c(n=%-6s?%~*e,Ry@.yLj1)9=W/,M%9kF;t<M`ZZ@ES9ocj#X');
define('SECURE_AUTH_KEY',  'r*!2>-o`U=nx:F{Mpx:~V#%-LxcFitx-w((+c-1I|N12yl(M_TaT)0%lrp0a!NR/');
define('LOGGED_IN_KEY',    '~#(@[[_DTUpQguD=uKMxrVZT3RK9TdATNJ`_mF^sxW?[Plrp5zY$;*/{FGMsc]#+');
define('NONCE_KEY',        '[rkzRL-2q;&9~ icW;DQ>!1L[,:h4e67Zb PmQ(BI+H9:cl]^Ru@U:7WIm%dk1uM');
define('AUTH_SALT',        'NaKR-./=zBA{-^g] bs_zrse5tL(}7:ik+7g=}51dL_X54c`8@KkXBau0ED1wOcY');
define('SECURE_AUTH_SALT', '5pP4]h)}]udoAR8*0/~mC|U.bP2psXr,FUyOrwHQFrN-0&/>A4M6G/*GYYG-<Wx!');
define('LOGGED_IN_SALT',   '0c+S6-S$8$}.vN|$r[1IH:By%UDl )QuQV<&Q`!|6U6$)o:%6gG8znNj!SnS_,t)');
define('NONCE_SALT',       ':nv31%7+wEFnL WZz*Gkd8&WTL~!HdoEc1&F]yUkkf%GfJvlw9TCM~IdEBl)xz)$');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each a unique
 * prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * WordPress Localized Language, defaults to English.
 *
 * Change this to localize WordPress. A corresponding MO file for the chosen
 * language must be installed to wp-content/languages. For example, install
 * de_DE.mo to wp-content/languages and set WPLANG to 'de_DE' to enable German
 * language support.
 */
define('WPLANG', '');

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
