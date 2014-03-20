/**
 *  Created by Kikstand, Inc.
 *  Author: Bo Coughlin
 *  Project: Www
 *  File: gruntfile.js
 *  Date: 3/18/14
 *  Time: 11:45 AM
 */


module.exports = function ( grunt ) {
    // Load grunt tasks
    require ( 'load-grunt-tasks' ) ( grunt );

    grunt.initConfig ( {
        pkg : grunt.file.readJSON ( 'package.json' ),
        client : './client',
        distdir : './dist',
        srcdir : '<%= client %>/src',
        vendor : '<%= client %>/vendor',
        banner : '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                 '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
                 ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n */\n',
        src : {
            js : ['<%= srcdir %>/**/*.js', '<%= distdir %>/templates/**/*.js'],
            specs : ['<%= srcdir %>/test/**/*.spec.js'],
            scenarios : ['<%= srcdir %>/test/**/*.scenario.js'],
            html : ['<%= srcdir %>/index.html'],
            tpl : {
                app : ['<%= srcdir %>/app/**/*.tpl.html'],
                common : ['<%= srcdir %>/common/**/*.tpl.html']
            },
            css : ['<%= srcdir %>/css/*.css' ],
            less : ['<%= srcdir %>/less/stylesheet.less'],
            lessWatch : ['<%= srcdir %>/less/*.less'],
            img : ['<%= srcdir %>/assets/img/*.{png, jpg, gif}']
        },
        // Clean dist directory
        clean : ['<%= distdir %>/*'],
        // Copy
        copy : {
            assets : {
                files : [
                    { dest : '<%= distdir %>', src : '**', expand : true, cwd : '<%= srcdir %>/assets/' }
                ]
            },
            firebase : {
                files : [
                    {
                        dest : '<%= distdir %>/',
                        src : '**',
                        expand : true,
                        cwd : '<%= vendor %>/firebase/',
                        flatten : true,
                        filter : 'isFile'
                    }
                ]
            },
            mocks : {
                files : [
                    {
                        dest : '<%= client %>/test/lib',
                        src : '**',
                        expand : true,
                        cwd : '<%= vendor %>/angular_mocks/',
                        flatten : true,
                        filter : 'isFile'
                    }
                ]
            }
        },
        // Html2js
        html2js : {
            app : {
                options : {
                    base : 'client/src/app'
                },
                src : ['<%= src.tpl.app %>'],
                dest : '<%= distdir %>/templates/app.js',
                module : 'templates.app'
            },
            common : {
                options : {
                    base : 'client/src'
                },
                src : ['<%= src.tpl.common %>'],
                dest : '<%= distdir %>/templates/common.js',
                module : 'templates.common'
            }
        },
        // Minify Css
        cssmin : {
            options : {
                banner : '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            combine : {
                files : {
                    '<%= distdir %>/common.css' : [ '<%= vendor %>/animate.css/*.css', '<%= vendor %>/angular-motion/*.css', '<%= src.css %>' ]
                }
            }
        },
        // Image Min
        imagemin : {  // grunt-contrib-imagemin
            dist : {
                files : [
                    {
                        expand : true,
                        cwd : '<%= distdir %>/img/',
                        src : '**/*.{jpg, gif}',
                        dest : '<%= distdir %>/img/'
                    }
                ]
            }
        },
        // Concatenate
        concat : {
            dist : {
                options : {
                    banner : '<%= banner %>'
                },
                src : ['<%= src.js %>'],
                dest : '<%= distdir %>/<%= pkg.name %>.js'
            },
            index : {
                src : ['<%= src.html %>'],
                dest : '<%= distdir %>/index.html',
                options : {
                    process : true
                }
            },
            angular : {
                src : ['<%= vendor %>/angular/angular.js', '<%= vendor %>/angular-route/angular-route.js',
                       '<%= vendor %>/angular-animate/angular-animate.js',
                       '<%= vendor %>/angular-resource/angular-resource.js',
                       '<%= vendor %>/angular-cookies/angular-cookies.js'],
                dest : '<%= distdir %>/angular.js'
            },
            jquery : {
                src : ['<%= vendor %>/jquery/jquery.js'],
                dest : '<%= distdir %>/jquery.js'
            },
            uibootstrap : {
                src : [ '<%= vendor %>/angular-ui-bootstrap-bower/ui-bootstrap-tpls.js'],
                dest : '<%= distdir %>/angular-ui-bootstrap.js'
            },
            ngstrap : {
                src : [ '<%= vendor %>/angular-strap/js/*.js'],
                dest : '<%= distdir %>/angular-strap.js'
            },
            lodash : {
                src : [ '<%= vendor %>/lodash/*.js'],
                dest : '<%= distdir %>/lodash.js'
            },
            holder : {
                src : [ '<%= vendor %>/holderjs/*.js'],
                dest : '<%= distdir %>/holder.js'
            },
            geofire : {
                src : [ '<%= vendor %>/geofire/*.js'],
                dest : '<%= distdir %>/geofire.js'
            }
        },
        // Less lint, process, min
        less : {
            options : {
                paths : ['<%= vendor %>/bootstrap/less']
            },
            build : {
                files : {
                    '<%= distdir %>/<%= pkg.name %>.css' : ['<%= src.less %>'] }
            },
            min : {
                files : {
                    '<%= distdir %>/<%= pkg.name %>.css' : ['<%= src.less %>']
                },
                options : {
                    compress : true
                }
            }
        },
        // JsHint
        jshint : {
            files : ['gruntfile.js', '<%= src.js %>'],
            options : {
                curly : true,
                eqeqeq : true,
                immed : true,
                latedef : true,
                newcap : true,
                noarg : true,
                sub : true,
                boss : true,
                eqnull : true,
                laxcomma : true,
                globals : {}
            }
        },
        // Bower
        bower : {
            install : {
                options : {
                    targetDir : './client/vendor',
                    layout : 'byComponent',
                    install : true,
                    verbose : true,
                    cleanup : true,
                    bowerOptions : {
                        forceLatest : true
                    }
                }
            }
        },
        watch : {
            all : {
                files : [ '<%= src.js %>', '<%= src.lessWatch %>', '<%= src.tpl.app %>', '<%= src.tpl.common %>', '<%= src.html %>' ],
                tasks : [ 'default', 'timestamp']
            },
            build : {
                files : [ '<%= src.js %>', '<%= src.lessWatch %>', '<%= src.css %>', '<%= src.img %>', '<%= src.tpl.app %>', '<%= src.tpl.common %>', '<%= src.html %>' ],
                tasks : [ 'build', 'timestamp']
            }
        }
    } );

    grunt.option ( 'force', true );
    grunt.registerTask ( 'install', ['bower', 'copy:mocks'] );
    grunt.registerTask ( 'default', ['jshint', 'build'] );
    grunt.registerTask ( 'build',
        ['clean', 'html2js', 'concat', 'less:build', 'cssmin', 'copy:assets', 'copy:firebase', 'imagemin'] );
    grunt.registerTask ( 'build-watch', ['jshint', 'watch:build' ] );

    // Print timestamp
    grunt.registerTask ( 'timestamp', function () {
        grunt.log.subhead ( new Date () );
    } );

};