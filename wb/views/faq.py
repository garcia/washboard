from django.shortcuts import render

def main(request):
    return render(request, 'faq.html', {'title': 'FAQ'})
