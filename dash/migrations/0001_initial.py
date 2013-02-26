# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Rule'
        db.create_table('dash_rule', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'])),
            ('keyword', self.gf('django.db.models.fields.TextField')(max_length=256)),
            ('blacklist', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('show_notification', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('show_user', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('show_keyword', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('scan_tags', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('scan_post', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('regex', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal('dash', ['Rule'])

        # Adding model 'WhitelistUser'
        db.create_table('dash_whitelistuser', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'])),
            ('other_user', self.gf('django.db.models.fields.TextField')(max_length=64)),
        ))
        db.send_create_signal('dash', ['WhitelistUser'])


    def backwards(self, orm):
        # Deleting model 'Rule'
        db.delete_table('dash_rule')

        # Deleting model 'WhitelistUser'
        db.delete_table('dash_whitelistuser')


    models = {
        'auth.group': {
            'Meta': {'object_name': 'Group'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'ordering': "('content_type__app_label', 'content_type__model', 'codename')", 'unique_together': "(('content_type', 'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'dash.rule': {
            'Meta': {'object_name': 'Rule'},
            'blacklist': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'keyword': ('django.db.models.fields.TextField', [], {'max_length': '256'}),
            'regex': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'scan_post': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'scan_tags': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'show_keyword': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'show_notification': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'show_user': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
        },
        'dash.whitelistuser': {
            'Meta': {'object_name': 'WhitelistUser'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'other_user': ('django.db.models.fields.TextField', [], {'max_length': '64'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"})
        }
    }

    complete_apps = ['dash']