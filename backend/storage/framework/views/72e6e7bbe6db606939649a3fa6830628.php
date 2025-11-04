<?php $__env->startComponent('mail::message'); ?>
# Confirm Your Email

Hi <?php echo e($user->name); ?>,

Thank you for registering with CreativeAI. To complete your registration, please confirm your email address by clicking the button below.

<?php $__env->startComponent('mail::button', ['url' => $confirmationUrl]); ?>
Confirm Email
<?php echo $__env->renderComponent(); ?>

This link will expire in <?php echo e($expiresIn); ?>.

If you did not create this account, you can safely ignore this email.

Thanks,<br>
<?php echo e(config('app.name')); ?>


<?php echo $__env->renderComponent(); ?>
<?php /**PATH /app/resources/views/emails/confirm-email.blade.php ENDPATH**/ ?>