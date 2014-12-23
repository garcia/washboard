from django import forms
from django.shortcuts import redirect, render

def order_fields(*field_list):
    def decorator(form):
        original_init = form.__init__
        def init(self, *args, **kwargs):
            original_init(self, *args, **kwargs)        
            for field in field_list[::-1]:
                self.fields.insert(0, field, self.fields.pop(field))
        form.__init__ = init
        return form            
    return decorator

class CommonPostForm(forms.Form):
    tags = forms.CharField(
        max_length=1000,
        widget=forms.TextInput(attrs={'placeholder': 'Tags (comma-separated)'})
    )

@order_fields('title', 'body')
class TextPostForm(CommonPostForm):
    title = forms.CharField(
        max_length=1000,
        widget=forms.TextInput(attrs={'placeholder': 'Title (optional)'})
    )
    body = forms.CharField(
        max_length=10000,
        widget=forms.Textarea(attrs={'placeholder': 'Body'})
    )

@order_fields('quote', 'source')
class QuotePostForm(CommonPostForm):
    quote = forms.CharField(
        max_length=10000,
        widget=forms.Textarea(attrs={'placeholder': 'Quote'})
    )
    source = forms.CharField(
        max_length=10000,
        widget=forms.Textarea(attrs={'placeholder': 'Source (optional)'})
    )

@order_fields('title', 'url', 'description')
class LinkPostForm(CommonPostForm):
    title = forms.CharField(
        max_length=1000,
        widget=forms.TextInput(attrs={'placeholder': 'Title (optional)'})
    )
    url = forms.URLField(
        max_length=1000,
        widget=forms.TextInput(attrs={'placeholder': 'URL'})
    )
    description = forms.CharField(
        max_length=10000,
        widget=forms.Textarea(attrs={'placeholder': 'Description (optional)'})
    )

@order_fields('title', 'conversation')
class ChatPostForm(CommonPostForm):
    title = forms.CharField(
        max_length=1000,
        widget=forms.TextInput(attrs={'placeholder': 'Title (optional)'})
    )
    conversation = forms.CharField(
        max_length=10000,
        widget=forms.Textarea(attrs={'placeholder': 'Conversation'})
    )

post_forms = {
    'text': TextPostForm,
    'quote': QuotePostForm,
    'link': LinkPostForm,
    'chat': ChatPostForm,
}

def main(request, post_type):
    if not request.user.is_authenticated():
        return redirect('/')

    data = {
        'title': 'New post',
        'post_type': post_type,
        'post_form': post_forms[post_type]
    }
    
    return render(request, 'new.html', data)
